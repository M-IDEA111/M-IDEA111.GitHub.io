// classic-novels-data.js - Classic Novels Database
const classicNovels = [
    { 
        id: 39,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        category: "classic",
        description: "A romantic novel about the Bennet family and the complicated relationships between Elizabeth Bennet and Mr. Darcy",
        pages: 5,
        coverImage: "pride-prejudice.jpg",
        content: [
            {
                title: "Chapter 1",
                description: "The famous opening introducing the Bennet family",
                image: "pride-prejudice.jpg",
                text: `<div class="episode-title">Chapter 1: The Universal Truth</div>
                <div class="book-description">
                    <strong>Book Description:</strong> A romantic novel about the Bennet family and the complicated relationships between Elizabeth Bennet and Mr. Darcy.
                </div>
                <p>It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.</p>
                <p>However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.</p>
                <p class="source-reference">Source: Pride and Prejudice by Jane Austen</p>`
            }
        ]
    }
];

if (typeof books === 'undefined') {
    var books = [];
}
books = books.concat(classicNovels);
console.log('📚 Classic Novels added. Total books:', books.length);