// search.js - ملف البحث المعدل بدون هيدر أو فوتر

// ==================== تهيئة الصفحة ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Search page loading...');
    
    // تحميل البيانات وتهيئة البحث
    initializeSearchPage();
});

// ==================== المتغيرات العامة ====================
let fuse = null;
let currentBook = null;
let currentPage = 0;
let searchHistory = JSON.parse(localStorage.getItem('mideaSearchHistory')) || [];
let searchTimeout = null;

// ==================== تهيئة صفحة البحث ====================
function initializeSearchPage() {
    console.log('Initializing search page...');
    
    // تحقق من تحميل بيانات الكتب
    if (typeof books === 'undefined' || books.length === 0) {
        console.log('Waiting for books data...');
        setTimeout(initializeSearchPage, 500);
        return;
    }
    
    console.log('Books data loaded:', books.length);
    
    // تهيئة محرك البحث
    initializeSearchEngine();
    
    // إعداد الأحداث
    setupEventListeners();
    
    // عرض سجل البحث
    displaySearchHistory();
    
    // التحقق من البحث في URL
    checkURLForSearch();
    
    // التركيز على حقل البحث
    setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
            console.log('Search input focused');
        }
    }, 800);
    
    console.log('Search page initialized successfully');
}

// ==================== تهيئة محرك البحث ====================
function initializeSearchEngine() {
    try {
        const options = {
            keys: [
                { name: 'title', weight: 0.6 },
                { name: 'author', weight: 0.3 },
                { name: 'category', weight: 0.1 },
                { name: 'description', weight: 0.1 }
            ],
            threshold: 0.4,
            includeScore: true,
            minMatchCharLength: 2
        };
        
        fuse = new Fuse(books, options);
        console.log('Search engine initialized with', books.length, 'books');
    } catch (error) {
        console.error('Failed to initialize search engine:', error);
    }
}

// ==================== وظائف البحث ====================
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const resultsGrid = document.getElementById('search-results');
    
    if (!searchInput || !resultsGrid) {
        console.error('Search elements not found');
        return;
    }
    
    const query = searchInput.value.trim();
    resultsGrid.innerHTML = '';
    
    if (!query) {
        return;
    }
    
    if (!fuse) {
        resultsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading search engine...</p>
            </div>`;
        setTimeout(initializeSearchEngine, 500);
        return;
    }
    
    console.log('Searching for:', query);
    
    try {
        const results = fuse.search(query);
        
        if (results.length === 0) {
            resultsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search-minus"></i>
                    <p>No results found for "${query}"</p>
                </div>`;
        } else {
            results.forEach(result => {
                const book = result.item;
                
                const card = document.createElement('div');
                card.className = 'book-card';
                card.innerHTML = `
                    <img src="${book.coverImage || 'logo.png'}" 
                         class="book-cover" 
                         alt="${book.title}"
                         onerror="this.src='logo.png'">
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">${book.author}</div>
                `;
                
                card.addEventListener('click', () => showBookDetails(book.id));
                resultsGrid.appendChild(card);
            });
            
            // إضافة إلى سجل البحث
            if (query.length >= 2) {
                addToSearchHistory(query);
            }
        }
    } catch (error) {
        console.error('Search error:', error);
        resultsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Search error occurred</p>
            </div>`;
    }
}

function debouncedSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300);
}

// ==================== سجل البحث ====================
function displaySearchHistory() {
    const historyList = document.getElementById('history-list');
    const historyFooter = document.getElementById('history-footer');
    
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    if (searchHistory.length === 0) {
        if (historyFooter) historyFooter.style.display = 'none';
        return;
    }
    
    const recentHistory = searchHistory.slice(-10).reverse();
    
    recentHistory.forEach(query => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="history-item-text">${query}</span>
            <button class="delete-history-item" data-query="${query}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        li.querySelector('.history-item-text').addEventListener('click', () => {
            document.getElementById('search-input').value = query;
            hideSearchHistory();
            performSearch();
        });
        
        li.querySelector('.delete-history-item').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSearchHistoryItem(query);
        });
        
        historyList.appendChild(li);
    });
    
    if (historyFooter) historyFooter.style.display = 'block';
}

function addToSearchHistory(query) {
    if (!query.trim()) return;
    
    // إزالة التكرارات
    searchHistory = searchHistory.filter(item => 
        item.toLowerCase() !== query.toLowerCase()
    );
    
    // إضافة الاستعلام الجديد
    searchHistory.push(query);
    
    // حفظ في localStorage
    localStorage.setItem('mideaSearchHistory', JSON.stringify(searchHistory));
    
    // تحديث العرض
    displaySearchHistory();
}

function deleteSearchHistoryItem(query) {
    searchHistory = searchHistory.filter(item => item !== query);
    localStorage.setItem('mideaSearchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

function showSearchHistory() {
    const searchHistoryContainer = document.getElementById('search-history');
    if (searchHistoryContainer && searchHistory.length > 0) {
        searchHistoryContainer.classList.add('show');
    }
}

function hideSearchHistory() {
    const searchHistoryContainer = document.getElementById('search-history');
    if (searchHistoryContainer) {
        searchHistoryContainer.classList.remove('show');
    }
}

function clearAllHistory() {
    searchHistory = [];
    localStorage.removeItem('mideaSearchHistory');
    displaySearchHistory();
    hideSearchHistory();
    hideDeleteModal();
}

function showDeleteModal() {
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) deleteModal.style.display = 'flex';
}

function hideDeleteModal() {
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) deleteModal.style.display = 'none';
}

// ==================== عرض تفاصيل الكتاب ====================
function showBookDetails(bookId) {
    console.log('Showing book details for ID:', bookId);
    
    if (typeof books === 'undefined' || !Array.isArray(books)) {
        console.error('Books data not available');
        return;
    }
    
    const book = books.find(b => b.id === bookId);
    if (!book) {
        console.error('Book not found:', bookId);
        return;
    }
    
    currentBook = book;
    
    // إخفاء نتائج البحث وإظهار التفاصيل
    const resultsGrid = document.getElementById('search-results');
    const searchHeader = document.querySelector('.search-header');
    const bookDetailsContainer = document.getElementById('book-details-container');
    
    if (resultsGrid) resultsGrid.style.display = 'none';
    if (searchHeader) searchHeader.style.display = 'none';
    if (bookDetailsContainer) bookDetailsContainer.style.display = 'block';
    
    // تعبئة بيانات الكتاب
    document.getElementById('details-cover-image').src = book.coverImage || 'logo.png';
    document.getElementById('details-cover-image').alt = book.title;
    document.getElementById('book-details-title').textContent = book.title;
    document.getElementById('book-details-author').textContent = book.author;
    document.getElementById('book-details-description').textContent = 
        book.description || 'No description available.';
    
    // تحميل الكتب ذات الصلة
    loadRelatedBooks(book);
    
    // التمرير للأعلى
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('Book details displayed:', book.title);
}

function backToSearch() {
    const resultsGrid = document.getElementById('search-results');
    const searchHeader = document.querySelector('.search-header');
    const bookDetailsContainer = document.getElementById('book-details-container');
    const readingContainer = document.getElementById('reading-container');
    
    if (bookDetailsContainer) bookDetailsContainer.style.display = 'none';
    if (readingContainer) readingContainer.style.display = 'none';
    if (resultsGrid) resultsGrid.style.display = 'grid';
    if (searchHeader) searchHeader.style.display = 'flex';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadRelatedBooks(book) {
    const container = document.getElementById('related-books-details-scroll');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (typeof books === 'undefined' || !Array.isArray(books)) {
        container.innerHTML = '<p class="no-related">Loading related books...</p>';
        return;
    }
    
    const relatedBooks = books
        .filter(b => b.category === book.category && b.id !== book.id)
        .slice(0, 5);
    
    if (relatedBooks.length === 0) {
        container.innerHTML = '<p class="no-related">No related books found</p>';
        return;
    }
    
    relatedBooks.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <img src="${book.coverImage || 'logo.png'}" class="book-cover" alt="${book.title}">
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author}</div>
        `;
        card.addEventListener('click', () => showBookDetails(book.id));
        container.appendChild(card);
    });
}

// ==================== القراءة ====================
function startReading() {
    if (!currentBook) {
        console.error('No book selected for reading');
        return;
    }
    
    currentPage = 0;
    
    const bookDetailsContainer = document.getElementById('book-details-container');
    const readingContainer = document.getElementById('reading-container');
    
    if (bookDetailsContainer) bookDetailsContainer.style.display = 'none';
    if (readingContainer) readingContainer.style.display = 'block';
    
    document.getElementById('reading-title').textContent = currentBook.title;
    displayPage();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('Started reading:', currentBook.title);
}

function displayPage() {
    if (!currentBook || !currentBook.content || !Array.isArray(currentBook.content)) {
        console.error('No book content available');
        return;
    }
    
    const contentDiv = document.getElementById('reading-content');
    if (!contentDiv) return;
    
    const page = currentBook.content[currentPage];
    contentDiv.innerHTML = `<div class="page-text">${page.text || 'No content'}</div>`;
    
    document.getElementById('page-indicator').textContent = 
        `Page ${currentPage + 1} of ${currentBook.content.length}`;
    
    document.getElementById('prev-page').disabled = currentPage === 0;
    document.getElementById('next-page').disabled = 
        currentPage === currentBook.content.length - 1;
}

function backToDetails() {
    const readingContainer = document.getElementById('reading-container');
    const bookDetailsContainer = document.getElementById('book-details-container');
    
    if (readingContainer) readingContainer.style.display = 'none';
    if (bookDetailsContainer) bookDetailsContainer.style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== إعداد الأحداث ====================
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // زر البحث
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            hideSearchHistory();
            performSearch();
        });
    }
    
    // حقل البحث
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                hideSearchHistory();
                performSearch();
            }
        });
        
        searchInput.addEventListener('input', debouncedSearch);
        
        searchInput.addEventListener('click', (e) => {
            e.stopPropagation();
            if (searchInput.value === '') {
                showSearchHistory();
            }
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                const resultsGrid = document.getElementById('search-results');
                if (resultsGrid) resultsGrid.innerHTML = '';
                showSearchHistory();
            }
        });
    }
    
    // سجل البحث
    document.addEventListener('click', (e) => {
        const searchHistoryContainer = document.getElementById('search-history');
        const searchInput = document.getElementById('search-input');
        
        if (searchHistoryContainer && 
            !searchHistoryContainer.contains(e.target) && 
            e.target !== searchInput) {
            hideSearchHistory();
        }
    });
    
    // مودال الحذف
    const clearHistoryBottomBtn = document.getElementById('clear-history-bottom');
    if (clearHistoryBottomBtn) {
        clearHistoryBottomBtn.addEventListener('click', showDeleteModal);
    }
    
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', clearAllHistory);
    }
    
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    }
    
    // أحداث الكتاب
    const startReadingBtn = document.getElementById('start-reading-btn');
    if (startReadingBtn) {
        startReadingBtn.addEventListener('click', startReading);
    }
    
    const backToSearchBtn = document.getElementById('back-to-search');
    if (backToSearchBtn) {
        backToSearchBtn.addEventListener('click', backToSearch);
    }
    
    const backToDetailsBtn = document.getElementById('back-to-details');
    if (backToDetailsBtn) {
        backToDetailsBtn.addEventListener('click', backToDetails);
    }
    
    // التنقل بين الصفحات
    const prevPageBtn = document.getElementById('prev-page');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                displayPage();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    const nextPageBtn = document.getElementById('next-page');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentBook && currentPage < currentBook.content.length - 1) {
                currentPage++;
                displayPage();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    // التمرير الأفقي للكتب ذات الصلة
    const relatedLeftBtn = document.getElementById('related-scroll-left');
    const relatedRightBtn = document.getElementById('related-scroll-right');
    const relatedContainer = document.getElementById('related-books-details-scroll');
    
    if (relatedLeftBtn && relatedRightBtn && relatedContainer) {
        relatedLeftBtn.addEventListener('click', () => {
            relatedContainer.scrollBy({ left: -200, behavior: 'smooth' });
        });
        
        relatedRightBtn.addEventListener('click', () => {
            relatedContainer.scrollBy({ left: 200, behavior: 'smooth' });
        });
    }
}

// ==================== فحص URL للبحث ====================
function checkURLForSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q')) {
        const query = urlParams.get('q');
        document.getElementById('search-input').value = query;
        setTimeout(() => performSearch(), 100);
    }
}