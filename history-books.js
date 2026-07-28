// history-books.js - History Books Database
const historyBooks = [
    { 
        id: 12,
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        category: "history",
        description: "An exploration of the history of human species from the Stone Age to the present",
        pages: 5,
        coverImage: "sapiens.jpg",
        content: [
            {
                title: "An Animal of No Significance",
                description: "Introduction to the history of Homo sapiens",
                image: "sapiens.jpg",
                text: `<div class="episode-title">Part 1: The Cognitive Revolution</div>
                <div class="book-description">
                    <strong>Book Description:</strong> An exploration of the history of human species from the Stone Age to the present.
                </div>
                <p>About 13.5 billion years ago, matter, energy, time and space came into being in what is known as the Big Bang. The story of these fundamental features of our universe is called physics.</p>
                <p>About 300,000 years after their appearance, matter and energy started to coalesce into complex structures, called atoms, which then combined into molecules. The story of atoms, molecules and their interactions is called chemistry.</p>
                <p>About 3.8 billion years ago, on a planet called Earth, certain molecules combined to form particularly large and intricate structures called organisms. The story of organisms is called biology.</p>
                <p class="source-reference">Source: Sapiens by Yuval Noah Harari</p>`
            }
        ]
    }
];

if (typeof books === 'undefined') {
    var books = [];
}
books = books.concat(historyBooks);
console.log('📚 History Books added. Total books:', books.length);