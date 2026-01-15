// المتغيرات العامة
let currentBook = null;
let currentPage = 0;
let searchResults = [];
let currentCategory = null;
let lastScrollTop = 0;
let slideMenuOpen = false;

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    // التحكم في شاشة البداية
    const urlParams = new URLSearchParams(window.location.search);
    const noSplash = urlParams.has('no-splash');
    const hasSeenSplash = sessionStorage.getItem('mideaSplashSeen');

    const splashScreen = document.getElementById('splash-screen');

    if (noSplash || hasSeenSplash) {
        // إخفاء الشاشة مباشرة
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
        // إزالة الباراميتر من URL
        if (noSplash) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    } else {
        // أول مرة في الجلسة - عرض الشاشة
        sessionStorage.setItem('mideaSplashSeen', 'true');
        setTimeout(() => {
            if (splashScreen) {
                splashScreen.style.display = 'none';
            }
        }, 3500);
    }
    
    // تحميل الكتب في الأقسام
    loadBooks();
    
    // التحقق إذا كان هناك كتاب محدد من صفحة البحث
    const selectedBookId = localStorage.getItem('mideaSelectedBookId');
    if (selectedBookId) {
        // تأخير بسيط لضمان تحميل جميع الكتب
        setTimeout(() => {
            const book = books.find(b => b.id === selectedBookId);
            if (book) {
                showBookDetails(book.id);
            }
            // مسح القيمة بعد الاستخدام
            localStorage.removeItem('mideaSelectedBookId');
        }, 500);
    }
    
    // إعداد الأحداث
    setupEventListeners();
    
    // إعداد التمرير الأفقي للكتب
    setupHorizontalScroll();
    
    // إعداد التمرير الأفقي للاقتراحات
    setupRelatedScroll();
    
    // إخفاء شاشة البداية بعد 3.5 ثانية
    setTimeout(() => {
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
    }, 3500);
});

// تحميل الكتب في الأقسام
function loadBooks() {
    console.log('Loading books...');
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
    console.log('Showing book details:', bookId);
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    currentBook = book;
    
    // إخفاء كل الأقسام وإظهار صفحة التفاصيل
    document.getElementById('books-section').style.display = 'none';
    document.getElementById('category-view').style.display = 'none';
    document.getElementById('search-results-section').style.display = 'none';
    document.getElementById('reading-container').style.display = 'none';
    document.getElementById('book-details-container').style.display = 'block';
    
    // تعبئة بيانات الكتاب
    document.getElementById('details-cover-image').src = book.coverImage;
    document.getElementById('details-cover-image').alt = book.title;
    document.getElementById('book-details-title').textContent = book.title;
    document.getElementById('book-details-description').textContent = book.description || 'No description available.';
    document.getElementById('book-details-author').textContent = book.author;
    
    // تحميل الكتب ذات الصلة في صفحة التفاصيل
    loadRelatedBooksInDetails(book);
    
    // التمرير للأعلى
    window.scrollTo(0, 0);
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
    
    // عرض المحتوى بدون صورة الغلاف
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

// البحث
function searchBooks(query) {
    const options = {
        includeScore: true,
        threshold: 0.4,
        keys: ['title', 'author', 'description', 'category']
    };
    
    const fuse = new Fuse(books, options);
    return fuse.search(query).map(result => result.item);
}

// إعداد الأحداث
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // التحكم في الهيدر عند التمرير
    window.addEventListener('scroll', function() {
        const header = document.getElementById('main-header');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // إظهار الهيدر عند التمرير للأعلى فقط
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            // التمرير للأسفل - إخفاء الهيدر
            header.classList.remove('header-visible');
            header.classList.add('header-hidden');
        } else {
            // التمرير للأعلى - إظهار الهيدر
            header.classList.remove('header-hidden');
            header.classList.add('header-visible');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
    
    // زر Transfer لفتح/إغلاق القائمة المنزلقة
    document.getElementById('transfer-btn').addEventListener('click', function() {
        toggleSlideMenu();
    });
    
    // زر إغلاق القائمة المنزلقة
    document.getElementById('close-menu').addEventListener('click', function() {
        closeSlideMenu();
    });
    
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
    document.getElementById('support-btn').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'mailto:suppor2tmidea@gmail.com?subject=Support Request - M IDEA Book';
    });
    
    // زر Start Reading - إصلاح مهم!
    document.getElementById('start-reading-btn').addEventListener('click', function() {
        startReadingFromDetails();
    });
    
    // التنقل بين الصفحات
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            displayPage();
            window.scrollTo(0, 0);
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        if (currentBook && currentPage < currentBook.content.length - 1) {
            currentPage++;
            displayPage();
            window.scrollTo(0, 0);
        }
    });
    
    // العودة للتفاصيل من القراءة
    document.getElementById('back-to-details').addEventListener('click', () => {
        document.getElementById('reading-container').style.display = 'none';
        document.getElementById('book-details-container').style.display = 'block';
        window.scrollTo(0, 0);
    });
    
    // العودة للقسم من التفاصيل
    document.getElementById('back-to-category').addEventListener('click', () => {
        document.getElementById('book-details-container').style.display = 'none';
        
        if (currentCategory) {
            // إذا كنا جايين من عرض تصنيف
            document.getElementById('category-view').style.display = 'block';
        } else {
            // إذا كنا جايين من الصفحة الرئيسية
            document.getElementById('books-section').style.display = 'block';
        }
        
        window.scrollTo(0, 0);
    });
    
    // العودة من البحث
    document.getElementById('back-from-search').addEventListener('click', () => {
        document.getElementById('search-results-section').style.display = 'none';
        document.getElementById('books-section').style.display = 'block';
        window.scrollTo(0, 0);
    });
    
    // العودة من التصنيف
    document.getElementById('back-from-category').addEventListener('click', () => {
        document.getElementById('category-view').style.display = 'none';
        document.getElementById('books-section').style.display = 'block';
        window.scrollTo(0, 0);
    });
    
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
            console.log('Category link clicked:', category);
            if (category) {
                showCategoryView(category);
                closeSlideMenu();
            }
        });
    });
    
    // منع نسخ الصور
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        showCopyWarning();
    });
    
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

// عرض التصنيف مع التمرير التلقائي للقسم
function showCategoryView(category) {
    console.log('showCategoryView called for:', category);
    
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
    
    // التمرير للأعلى مباشرة
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