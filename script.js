// script.js - Version 3.0 (كامل)

// المتغيرات العامة
let currentBook = null;
let currentPage = 0;
let searchResults = [];
let currentCategory = null;
let lastScrollTop = 0;
let slideMenuOpen = false;
let booksLoaded = false;

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing M IDEA Book...');
    
    // التحكم في شاشة البداية
    const urlParams = new URLSearchParams(window.location.search);
    const noSplash = urlParams.has('no-splash');
    const hasSeenSplash = sessionStorage.getItem('mideaSplashSeen');
    const splashScreen = document.getElementById('splash-screen');

    if (noSplash || hasSeenSplash) {
        if (splashScreen) splashScreen.style.display = 'none';
        if (noSplash) window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        sessionStorage.setItem('mideaSplashSeen', 'true');
        setTimeout(() => {
            if (splashScreen) splashScreen.style.display = 'none';
        }, 3500);
    }
    
    // تحميل الكتب في الأقسام
    loadBooks();
    
    // إعداد الأحداث
    setupEventListeners();
    
    // إعداد التمرير الأفقي
    setupHorizontalScroll();
    setupRelatedScroll();
    
    // التحقق من وجود كتاب محدد من البحث
    checkForBookFromSearch();
});

// تحميل الكتب في الأقسام
function loadBooks() {
    console.log('Loading books, total available:', books ? books.length : 0);
    
    if (!books || books.length === 0) {
        console.error('No books data available!');
        setTimeout(loadBooks, 500); // المحاولة مرة أخرى
        return;
    }
    
    booksLoaded = true;
    const categories = ['anime', 'classic', 'arabic', 'international', 'development', 'history'];
    
    categories.forEach(category => {
        const categoryBooks = books.filter(book => book.category === category);
        const containerId = `${category}-books-scroll`;
        const container = document.getElementById(containerId);
        
        if (container) {
            container.innerHTML = '';
            categoryBooks.forEach(book => {
                const bookCard = createBookCard(book);
                container.appendChild(bookCard);
            });
        }
    });
    
    console.log('Books loaded successfully');
}

// التحقق من كتاب من البحث
function checkForBookFromSearch() {
    console.log('Checking for book from search...');
    
    // الطريقة 1: من localStorage
    const selectedBookId = localStorage.getItem('mideaSelectedBookId');
    const redirectData = localStorage.getItem('mideaBookRedirect');
    
    // الطريقة 2: من URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const bookIdFromUrl = urlParams.get('bookId');
    const fromSearch = urlParams.has('fromSearch');
    
    let bookIdToShow = null;
    
    if (selectedBookId) {
        console.log('Found book ID in localStorage:', selectedBookId);
        bookIdToShow = selectedBookId;
    } else if (bookIdFromUrl && fromSearch) {
        console.log('Found book ID in URL:', bookIdFromUrl);
        bookIdToShow = bookIdFromUrl;
    }
    
    if (bookIdToShow) {
        console.log('Attempting to show book:', bookIdToShow);
        
        // الانتظار حتى تحميل الكتب
        const checkInterval = setInterval(() => {
            if (booksLoaded && books && books.length > 0) {
                clearInterval(checkInterval);
                
                const book = books.find(b => b.id === bookIdToShow);
                if (book) {
                    console.log('Book found, showing details:', book.title);
                    
                    // تأخير بسيط لضمان عرض الصفحة
                    setTimeout(() => {
                        showBookDetails(book.id);
                        
                        // تنظيف البيانات
                        localStorage.removeItem('mideaSelectedBookId');
                        localStorage.removeItem('mideaBookRedirect');
                        
                        // تحديث URL بدون الباراميترات
                        if (fromSearch) {
                            window.history.replaceState({}, document.title, window.location.pathname);
                        }
                    }, 300);
                } else {
                    console.error('Book not found with ID:', bookIdToShow);
                }
            }
        }, 100);
        
        // مهلة 5 ثوانٍ كحد أقصى
        setTimeout(() => {
            clearInterval(checkInterval);
            console.log('Timeout waiting for books to load');
        }, 5000);
    }
}

// إنشاء بطاقة كتاب
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.id = book.id;
    
    card.innerHTML = `
        <div class="book-cover">
            <img src="${book.coverImage}" alt="${book.title}" class="cover-image">
        </div>
        <h4 class="book-title">${book.title}</h4>
        <div class="book-author">${book.author}</div>
    `;
    
    card.addEventListener('click', () => showBookDetails(book.id));
    
    // منع سحب الصورة
    const img = card.querySelector('img');
    img.addEventListener('dragstart', (e) => e.preventDefault());
    img.addEventListener('contextmenu', (e) => e.preventDefault());
    
    return card;
}

// عرض صفحة تفاصيل الكتاب
function showBookDetails(bookId) {
    console.log('showBookDetails called for:', bookId);
    
    const book = books.find(b => b.id === bookId);
    if (!book) {
        console.error('Book not found:', bookId);
        return;
    }
    
    currentBook = book;
    
    // إخفاء كل الأقسام
    document.getElementById('books-section').style.display = 'none';
    document.getElementById('category-view').style.display = 'none';
    document.getElementById('search-results-section').style.display = 'none';
    document.getElementById('reading-container').style.display = 'none';
    
    // إظهار صفحة التفاصيل
    const detailsContainer = document.getElementById('book-details-container');
    if (detailsContainer) {
        detailsContainer.style.display = 'block';
    }
    
    // تعبئة البيانات
    const coverImg = document.getElementById('details-cover-image');
    if (coverImg) {
        coverImg.src = book.coverImage;
        coverImg.alt = book.title;
    }
    
    const titleEl = document.getElementById('book-details-title');
    if (titleEl) titleEl.textContent = book.title;
    
    const descEl = document.getElementById('book-details-description');
    if (descEl) descEl.textContent = book.description || 'No description available.';
    
    const authorEl = document.getElementById('book-details-author');
    if (authorEl) authorEl.textContent = book.author;
    
    // تحميل الكتب ذات الصلة
    loadRelatedBooksInDetails(book);
    
    // التمرير للأعلى
    window.scrollTo(0, 0);
    
    console.log('Book details shown successfully:', book.title);
}

// بدء القراءة من صفحة التفاصيل
function startReadingFromDetails() {
    console.log('Starting reading from details...');
    if (!currentBook) {
        console.error('No current book selected');
        return;
    }
    
    currentPage = 0;
    
    // إخفاء صفحة التفاصيل وإظهار قسم القراءة
    document.getElementById('book-details-container').style.display = 'none';
    document.getElementById('reading-container').style.display = 'block';
    
    // تعيين العنوان
    document.getElementById('reading-title').textContent = currentBook.title;
    
    // عرض المحتوى
    displayPage();
    
    // التمرير للأعلى
    window.scrollTo(0, 0);
    
    console.log('Reading started for book:', currentBook.title);
}

// عرض الصفحة في قسم القراءة
function displayPage() {
    if (!currentBook || !currentBook.content) {
        console.error('No book content available');
        return;
    }
    
    const contentDiv = document.getElementById('reading-content');
    const page = currentBook.content[currentPage];
    
    // عرض المحتوى
    contentDiv.innerHTML = `
        <div class="page-text">${page.text}</div>
    `;
    
    // تحديث مؤشر الصفحة
    document.getElementById('page-indicator').textContent = 
        `Page ${currentPage + 1} of ${currentBook.content.length}`;
    
    // تحديث أزرار التنقل
    document.getElementById('prev-page').disabled = currentPage === 0;
    document.getElementById('next-page').disabled = currentPage === currentBook.content.length - 1;
}

// تحميل الكتب ذات الصلة في صفحة التفاصيل
function loadRelatedBooksInDetails(book) {
    const relatedBooks = books
        .filter(b => b.category === book.category && b.id !== book.id)
        .slice(0, 5);
    
    const container = document.getElementById('related-books-details-scroll');
    container.innerHTML = '';
    
    if (relatedBooks.length === 0) {
        container.innerHTML = '<p class="no-related">No related books found.</p>';
        return;
    }
    
    relatedBooks.forEach(book => {
        const relatedCard = document.createElement('div');
        relatedCard.className = 'book-card';
        relatedCard.dataset.id = book.id;
        
        relatedCard.innerHTML = `
            <div class="book-cover">
                <img src="${book.coverImage}" alt="${book.title}" class="cover-image">
            </div>
            <h4 class="book-title">${book.title}</h4>
            <div class="book-author">${book.author}</div>
        `;
        
        relatedCard.addEventListener('click', () => showBookDetails(book.id));
        
        // منع سحب الصورة
        const img = relatedCard.querySelector('img');
        img.addEventListener('dragstart', (e) => e.preventDefault());
        img.addEventListener('contextmenu', (e) => e.preventDefault());
        
        container.appendChild(relatedCard);
    });
}

// إعداد التمرير الأفقي للكتب
function setupHorizontalScroll() {
    const categories = ['anime', 'classic', 'arabic', 'international', 'development', 'history'];
    
    categories.forEach(category => {
        const leftBtn = document.querySelector(`.${category}-scroll-left`);
        const rightBtn = document.querySelector(`.${category}-scroll-right`);
        const container = document.getElementById(`${category}-books-scroll`);
        
        if (leftBtn && rightBtn && container) {
            leftBtn.addEventListener('click', () => {
                container.scrollBy({ left: -200, behavior: 'smooth' });
            });
            
            rightBtn.addEventListener('click', () => {
                container.scrollBy({ left: 200, behavior: 'smooth' });
            });
        }
    });
}

// إعداد التمرير الأفقي للاقتراحات
function setupRelatedScroll() {
    const leftBtn = document.getElementById('related-scroll-left');
    const rightBtn = document.getElementById('related-scroll-right');
    const container = document.getElementById('related-books-details-scroll');
    
    if (leftBtn && rightBtn && container) {
        leftBtn.addEventListener('click', () => {
            container.scrollBy({ left: -200, behavior: 'smooth' });
        });
        
        rightBtn.addEventListener('click', () => {
            container.scrollBy({ left: 200, behavior: 'smooth' });
        });
    }
}

// إعداد الأحداث
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // التحكم في الهيدر عند التمرير
    window.addEventListener('scroll', function() {
        const header = document.getElementById('main-header');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            header.classList.remove('header-visible');
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
            header.classList.add('header-visible');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
    
    // زر Transfer
    const transferBtn = document.getElementById('transfer-btn');
    if (transferBtn) {
        transferBtn.addEventListener('click', toggleSlideMenu);
    }
    
    // زر إغلاق القائمة
    const closeMenuBtn = document.getElementById('close-menu');
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeSlideMenu);
    }
    
    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', function(event) {
        const slideMenu = document.getElementById('slide-menu');
        const transferBtn = document.getElementById('transfer-btn');
        
        if (slideMenuOpen && 
            !slideMenu.contains(event.target) && 
            !transferBtn.contains(event.target)) {
            closeSlideMenu();
        }
    });
    
    // زر Support
    const supportBtn = document.getElementById('support-btn');
    if (supportBtn) {
        supportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'mailto:suppor2tmidea@gmail.com?subject=Support Request - M IDEA Book';
        });
    }
    
    // زر Start Reading
    const startReadingBtn = document.getElementById('start-reading-btn');
    if (startReadingBtn) {
        startReadingBtn.addEventListener('click', startReadingFromDetails);
    }
    
    // التنقل بين الصفحات
    const prevPageBtn = document.getElementById('prev-page');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                displayPage();
                window.scrollTo(0, 0);
            }
        });
    }
    
    const nextPageBtn = document.getElementById('next-page');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentBook && currentPage < currentBook.content.length - 1) {
                currentPage++;
                displayPage();
                window.scrollTo(0, 0);
            }
        });
    }
    
    // العودة للتفاصيل من القراءة
    const backToDetailsBtn = document.getElementById('back-to-details');
    if (backToDetailsBtn) {
        backToDetailsBtn.addEventListener('click', () => {
            document.getElementById('reading-container').style.display = 'none';
            document.getElementById('book-details-container').style.display = 'block';
            window.scrollTo(0, 0);
        });
    }
    
    // العودة للقسم من التفاصيل
    const backToCategoryBtn = document.getElementById('back-to-category');
    if (backToCategoryBtn) {
        backToCategoryBtn.addEventListener('click', () => {
            document.getElementById('book-details-container').style.display = 'none';
            
            if (currentCategory) {
                document.getElementById('category-view').style.display = 'block';
            } else {
                document.getElementById('books-section').style.display = 'block';
            }
            
            window.scrollTo(0, 0);
        });
    }
    
    // العودة من البحث
    const backFromSearchBtn = document.getElementById('back-from-search');
    if (backFromSearchBtn) {
        backFromSearchBtn.addEventListener('click', () => {
            document.getElementById('search-results-section').style.display = 'none';
            document.getElementById('books-section').style.display = 'block';
            window.scrollTo(0, 0);
        });
    }
    
    // العودة من التصنيف
    const backFromCategoryBtn = document.getElementById('back-from-category');
    if (backFromCategoryBtn) {
        backFromCategoryBtn.addEventListener('click', () => {
            document.getElementById('category-view').style.display = 'none';
            document.getElementById('books-section').style.display = 'block';
            window.scrollTo(0, 0);
        });
    }
    
    // نقرات على عناوين التصنيفات
    document.querySelectorAll('.category-title').forEach(title => {
        title.addEventListener('click', () => {
            const category = title.dataset.category;
            showCategoryView(category);
        });
    });
    
    // نقرات على أزرار التصنيفات في القائمة والفوتر
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            if (category) {
                showCategoryView(category);
                closeSlideMenu();
            }
        });
    });
    
    // منع النسخ
    document.addEventListener('copy', showCopyWarning);
    
    // منع النقر الأيمن على الصور
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            showCopyWarning();
        }
    });
    
    // منع سحب الصور
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            showCopyWarning();
        }
    });
    
    // إضافة: زر البحث في الهيدر
    const searchBtnHeader = document.getElementById('search-icon-btn');
    if (searchBtnHeader) {
        searchBtnHeader.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'search.html';
        });
    }
    
    console.log('Event listeners setup complete');
}

// فتح/إغلاق القائمة المنزلقة
function toggleSlideMenu() {
    const slideMenu = document.getElementById('slide-menu');
    slideMenuOpen = !slideMenuOpen;
    
    if (slideMenuOpen) {
        slideMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        slideMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeSlideMenu() {
    const slideMenu = document.getElementById('slide-menu');
    slideMenu.classList.remove('active');
    slideMenuOpen = false;
    document.body.style.overflow = '';
}

// عرض التصنيف
function showCategoryView(category) {
    const categoryBooks = books.filter(book => book.category === category);
    currentCategory = category;
    
    // إخفاء كل شيء وإظهار عرض التصنيف
    document.getElementById('books-section').style.display = 'none';
    document.getElementById('reading-container').style.display = 'none';
    document.getElementById('search-results-section').style.display = 'none';
    document.getElementById('book-details-container').style.display = 'none';
    document.getElementById('category-view').style.display = 'block';
    
    // تعيين العنوان
    const categoryNames = {
        'anime': 'Anime Books',
        'classic': 'Classic Novels',
        'arabic': 'Arabic Novels',
        'international': 'International Novels',
        'development': 'Personal Development',
        'history': 'History Books'
    };
    
    document.getElementById('category-view-title').textContent = categoryNames[category] || category;
    
    // عرض الكتب
    const booksGrid = document.getElementById('category-books-grid');
    booksGrid.innerHTML = '';
    
    categoryBooks.forEach(book => {
        const bookCard = createBookCard(book);
        booksGrid.appendChild(bookCard);
    });
    
    // التمرير للأعلى
    window.scrollTo(0, 0);
}

// عرض تحذير النسخ
function showCopyWarning() {
    const warning = document.getElementById('copy-warning');
    if (!warning) return;
    
    warning.style.display = 'flex';
    
    setTimeout(() => {
        warning.style.display = 'none';
    }, 3000);
}

// دالة البحث (للبحث داخل الصفحة الرئيسية)
function searchBooks(query) {
    const options = {
        includeScore: true,
        threshold: 0.4,
        keys: ['title', 'author', 'description', 'category']
    };
    
    const fuse = new Fuse(books, options);
    return fuse.search(query).map(result => result.item);
}