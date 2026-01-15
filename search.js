// search.js - Version 3.0

// Search engine settings
const fuseOptions = {
    keys: [
        { name: "title", weight: 0.7 },
        { name: "author", weight: 0.3 },
        { name: "category", weight: 0.2 },
        { name: "description", weight: 0.1 }
    ],
    threshold: 0.3,
    distance: 50,
    includeScore: true,
    minMatchCharLength: 1,
    findAllMatches: true,
    ignoreLocation: true,
    useExtendedSearch: true
};

// Main elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsGrid = document.getElementById('search-results');

// Search history elements
const searchHistoryContainer = document.getElementById('search-history');
const historyList = document.getElementById('history-list');
const clearHistoryBottomBtn = document.getElementById('clear-history-bottom');
const historyFooter = document.getElementById('history-footer');

// Modal elements
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

// Initialize search history from localStorage
let searchHistory = JSON.parse(localStorage.getItem('mideaSearchHistory')) || [];

// متغير لـ debounce
let searchTimeout;
let fuse = null;

// تهيئة محرك البحث
function initializeSearch() {
    console.log('initializeSearch called');
    
    // المحاولة مع books أولاً
    if (typeof books !== 'undefined' && books.length > 0) {
        console.log('Using books array, length:', books.length);
        fuse = new Fuse(books, fuseOptions);
        return true;
    }
    // ثم المحاولة مع allBooks
    else if (typeof allBooks !== 'undefined' && allBooks.length > 0) {
        console.log('Using allBooks array, length:', allBooks.length);
        fuse = new Fuse(allBooks, fuseOptions);
        return true;
    }
    // إذا لم تكن البيانات متاحة
    else {
        console.error('No books data found!');
        resultsGrid.innerHTML = '<div class="no-results">Loading books data...</div>';
        
        // المحاولة مرة أخرى بعد ثانية
        setTimeout(() => {
            initializeSearch();
        }, 1000);
        return false;
    }
}

// عرض سجل البحث
function displaySearchHistory() {
    historyList.innerHTML = '';
    
    if (searchHistory.length === 0) {
        historyFooter.classList.remove('show');
        return;
    }
    
    const recentHistory = searchHistory.slice(-10).reverse();
    
    recentHistory.forEach(query => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="history-item-text">${query}</span>
            <button class="delete-history-item" data-query="${query}" title="Delete item">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        li.querySelector('.history-item-text').addEventListener('click', () => {
            searchInput.value = query;
            hideSearchHistory();
            performSearch();
        });
        
        li.querySelector('.delete-history-item').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSearchHistoryItem(query);
        });
        
        historyList.appendChild(li);
    });
    
    if (searchHistory.length > 0) {
        historyFooter.classList.add('show');
    }
}

// إضافة إلى سجل البحث
function addToSearchHistory(query) {
    if (!query.trim()) return;
    
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== query.toLowerCase());
    searchHistory.push(query);
    localStorage.setItem('mideaSearchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

// حذف عنصر من السجل
function deleteSearchHistoryItem(query) {
    searchHistory = searchHistory.filter(item => item !== query);
    localStorage.setItem('mideaSearchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

// إظهار/إخفاء سجل البحث
function showSearchHistory() {
    if (searchHistory.length > 0) {
        searchHistoryContainer.classList.add('show');
    }
}

function hideSearchHistory() {
    searchHistoryContainer.classList.remove('show');
}

// مودال تأكيد الحذف
function showDeleteModal() {
    deleteModal.classList.add('show');
}

function hideDeleteModal() {
    deleteModal.classList.remove('show');
}

// حذف كل السجل
function clearAllHistory() {
    searchHistory = [];
    localStorage.removeItem('mideaSearchHistory');
    displaySearchHistory();
    hideSearchHistory();
    hideDeleteModal();
}

// دالة البحث الرئيسية - تم تحديثها
function performSearch() {
    const query = searchInput.value.trim();
    resultsGrid.innerHTML = '';

    if (query === "") {
        resultsGrid.innerHTML = '';
        return;
    }

    if (!fuse) {
        resultsGrid.innerHTML = '<div class="no-results">Initializing search engine...</div>';
        setTimeout(() => {
            initializeSearch();
            performSearch();
        }, 300);
        return;
    }

    const results = fuse.search(query);
    
    if (results.length === 0) {
        resultsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search-minus"></i>
                <p>No results for "${query}"</p>
            </div>`;
    } else {
        const limitedResults = results.slice(0, 50);
        
        limitedResults.forEach(result => {
            const book = result.item;
            
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <img src="${book.coverImage}" class="book-cover" onerror="this.src='logo.png'" loading="lazy">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
            `;
            
            // حدث النقر المهم - تم تحسينه
            card.addEventListener('click', function() {
                console.log('Book clicked:', book.id, '-', book.title);
                
                // اختبار حفظ البيانات
                const testData = {
                    id: book.id,
                    title: book.title,
                    timestamp: new Date().getTime()
                };
                
                // حفظ في localStorage
                localStorage.setItem('mideaSelectedBookId', book.id);
                localStorage.setItem('mideaBookRedirect', JSON.stringify(testData));
                
                console.log('Saved to localStorage:', book.id);
                console.log('Test data:', testData);
                
                // الانتقال مع إضافة باراميتر لمنع الشاشة
                window.location.href = 'index.html?fromSearch=true&bookId=' + book.id;
            });
            
            resultsGrid.appendChild(card);
        });
        
        if (results.length > 50) {
            const countDiv = document.createElement('div');
            countDiv.className = 'no-results';
            countDiv.style.fontSize = '0.9rem';
            countDiv.style.color = '#aaa';
            countDiv.innerHTML = `Showing 50 of ${results.length} results`;
            resultsGrid.appendChild(countDiv);
        }
    }

    if (query.length >= 2) {
        addToSearchHistory(query);
    }
}

// بحث محسن
function debouncedSearch() {
    clearTimeout(searchTimeout);
    
    const query = searchInput.value.trim();
    
    if (query.length === 0) {
        resultsGrid.innerHTML = '';
        showSearchHistory();
        return;
    }
    
    searchTimeout = setTimeout(() => {
        hideSearchHistory();
        performSearch();
    }, 300);
}

// أحداث

// 1. زر البحث
searchBtn.addEventListener('click', () => {
    hideSearchHistory();
    performSearch();
});

// 2. زر Enter
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        hideSearchHistory();
        performSearch();
    }
});

// 3. النقر على حقل البحث
searchInput.addEventListener('click', (e) => {
    e.stopPropagation();
    if (searchInput.value.trim() === '') {
        showSearchHistory();
    }
});

// 4. الكتابة في حقل البحث
searchInput.addEventListener('input', () => {
    debouncedSearch();
});

// 5. إغلاق السجل عند النقر خارجها
document.addEventListener('click', (e) => {
    if (!searchHistoryContainer.contains(e.target) && e.target !== searchInput) {
        hideSearchHistory();
    }
});

// 6. منع إغلاق السجل عند النقر داخله
searchHistoryContainer.addEventListener('click', (e) => {
    e.stopPropagation();
});

// 7. زر حذف الكل
clearHistoryBottomBtn.addEventListener('click', showDeleteModal);

// 8. أزرار المودال
confirmDeleteBtn.addEventListener('click', clearAllHistory);
cancelDeleteBtn.addEventListener('click', hideDeleteModal);

// 9. إغلاق المودال بالنقر خارجها
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        hideDeleteModal();
    }
});

// تهيئة الصفحة
window.addEventListener('load', () => {
    console.log('Search page fully loaded');
    
    // تأخير بسيط لضمان تحميل data.js
    setTimeout(() => {
        console.log('Initializing search after delay...');
        initializeSearch();
        displaySearchHistory();
        
        // البحث إذا كان هناك استعلام في URL
        const params = new URLSearchParams(window.location.search);
        if (params.has('q')) {
            searchInput.value = params.get('q');
            performSearch();
        }
        
        // التركيز على حقل البحث
        searchInput.focus();
        
        // حدث لمسح الحقل
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                resultsGrid.innerHTML = '';
                showSearchHistory();
            }
        });
    }, 500);
});