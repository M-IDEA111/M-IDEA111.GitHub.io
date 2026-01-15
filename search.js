// search.js - English Version

// Search engine settings مع تحسينات للأداء
const fuseOptions = {
    keys: [
        { name: "title", weight: 0.7 },
        { name: "author", weight: 0.3 },
        { name: "category", weight: 0.2 },
        { name: "description", weight: 0.1 }
    ],
    threshold: 0.3, // تخفيض العتبة لجعل البحث أكثر تساهلاً
    distance: 50,   // تقليل المسافة
    includeScore: true,
    minMatchCharLength: 1, // البحث بحرف واحد فقط
    findAllMatches: true,
    ignoreLocation: true,  // تجاهل موقع النص
    useExtendedSearch: true
};

// Ensure data is loaded from external file
let fuse;
if (typeof allBooks !== 'undefined') {
    fuse = new Fuse(allBooks, fuseOptions);
}

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

// Display search history
function displaySearchHistory() {
    historyList.innerHTML = '';
    
    if (searchHistory.length === 0) {
        historyFooter.classList.remove('show');
        return;
    }
    
    // Show only last 10 searches (newest to oldest)
    const recentHistory = searchHistory.slice(-10).reverse();
    
    recentHistory.forEach(query => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="history-item-text">${query}</span>
            <button class="delete-history-item" data-query="${query}" title="Delete item">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // When clicking on history item
        li.querySelector('.history-item-text').addEventListener('click', () => {
            searchInput.value = query;
            hideSearchHistory();
            performSearch();
        });
        
        // Delete item button
        li.querySelector('.delete-history-item').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSearchHistoryItem(query);
        });
        
        historyList.appendChild(li);
    });
    
    // Show clear all button at bottom if there is history
    if (searchHistory.length > 0) {
        historyFooter.classList.add('show');
    }
}

// Add query to search history
function addToSearchHistory(query) {
    if (!query.trim()) return;
    
    // Remove if already exists (avoid duplicates)
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== query.toLowerCase());
    
    // Add new query
    searchHistory.push(query);
    
    // Save to localStorage
    localStorage.setItem('mideaSearchHistory', JSON.stringify(searchHistory));
    
    // Update display
    displaySearchHistory();
}

// Delete item from search history
function deleteSearchHistoryItem(query) {
    searchHistory = searchHistory.filter(item => item !== query);
    localStorage.setItem('mideaSearchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

// Show/hide search history
function showSearchHistory() {
    if (searchHistory.length > 0) {
        searchHistoryContainer.classList.add('show');
    }
}

function hideSearchHistory() {
    searchHistoryContainer.classList.remove('show');
}

// Show/hide delete confirmation modal
function showDeleteModal() {
    deleteModal.classList.add('show');
}

function hideDeleteModal() {
    deleteModal.classList.remove('show');
}

// Clear all search history
function clearAllHistory() {
    searchHistory = [];
    localStorage.removeItem('mideaSearchHistory');
    displaySearchHistory();
    hideSearchHistory();
    hideDeleteModal();
}

// Perform search with debounce for better performance
function performSearch() {
    const query = searchInput.value.trim();
    resultsGrid.innerHTML = '';

    if (query === "") {
        resultsGrid.innerHTML = '';
        return;
    }

    if (!fuse) {
        resultsGrid.innerHTML = '<div class="no-results">Error loading data</div>';
        return;
    }

    // Search with the query
    const results = fuse.search(query);
    
    if (results.length === 0) {
        resultsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search-minus"></i>
                <p>No results for "${query}"</p>
            </div>`;
    } else {
        // Limit results for better performance
        const limitedResults = results.slice(0, 50);
        
        limitedResults.forEach(result => {
            const book = result.item;
            
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <img src="${book.coverImage}" class="book-cover" onerror="this.src='logo.webp'" loading="lazy">
                <div class="book-title">${book.title}</div>
                <div class="book-author">${book.author}</div>
            `;
            
            // Go to book page
            card.onclick = () => window.location.href = `index.html?bookId=${book.id}`;
            resultsGrid.appendChild(card);
        });
        
        // Show count if there are many results
        if (results.length > 50) {
            const countDiv = document.createElement('div');
            countDiv.className = 'no-results';
            countDiv.style.fontSize = '0.9rem';
            countDiv.style.color = '#aaa';
            countDiv.innerHTML = `Showing 50 of ${results.length} results`;
            resultsGrid.appendChild(countDiv);
        }
    }

    // Add to search history
    if (query.length >= 2) { // Only add to history if query is at least 2 characters
        addToSearchHistory(query);
    }
}

// Optimized search with debounce
function debouncedSearch() {
    clearTimeout(searchTimeout);
    
    const query = searchInput.value.trim();
    
    if (query.length === 0) {
        resultsGrid.innerHTML = '';
        showSearchHistory();
        return;
    }
    
    if (query.length === 1) {
        // Search immediately for single character
        searchTimeout = setTimeout(() => {
            hideSearchHistory();
            performSearch();
        }, 100); // Reduced delay for single character
    } else {
        // Slightly longer delay for longer queries
        searchTimeout = setTimeout(() => {
            hideSearchHistory();
            performSearch();
        }, 200);
    }
}

// Events

// 1. When clicking search button
searchBtn.addEventListener('click', () => {
    hideSearchHistory();
    performSearch();
});

// 2. When pressing Enter
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        hideSearchHistory();
        performSearch();
    }
});

// 3. When clicking search input - show history
searchInput.addEventListener('click', (e) => {
    e.stopPropagation();
    if (searchInput.value.trim() === '') {
        showSearchHistory();
    }
});

// 4. When typing in search input - optimized with debounce
searchInput.addEventListener('input', () => {
    debouncedSearch();
});

// 5. Close history when clicking outside
document.addEventListener('click', (e) => {
    if (!searchHistoryContainer.contains(e.target) && e.target !== searchInput) {
        hideSearchHistory();
    }
});

// 6. Prevent closing history when clicking inside
searchHistoryContainer.addEventListener('click', (e) => {
    e.stopPropagation();
});

// 7. Clear all history button at bottom
clearHistoryBottomBtn.addEventListener('click', showDeleteModal);

// 8. Modal buttons
confirmDeleteBtn.addEventListener('click', clearAllHistory);
cancelDeleteBtn.addEventListener('click', hideDeleteModal);

// 9. Close modal when clicking outside
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        hideDeleteModal();
    }
});

// Initialize page
window.onload = () => {
    // Display search history
    displaySearchHistory();
    
    // Search if there's a query in URL
    const params = new URLSearchParams(window.location.search);
    if (params.has('q')) {
        searchInput.value = params.get('q');
        performSearch();
    } else {
        resultsGrid.innerHTML = '';
    }
    
    // Focus on search input
    searchInput.focus();
    
    // Add event for clearing input
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            resultsGrid.innerHTML = '';
            showSearchHistory();
        }
    });
};