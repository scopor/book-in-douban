const API_KEY = "0ac44ae016490db2204ce0a042db2916"; // 网上的公共key

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getBookInfo") {
    const url = `https://api.douban.com/v2/book/search?q=${encodeURIComponent(request.bookName)}&count=20&apikey=${API_KEY}`;
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.books && data.books.length > 0) {
		  const filteredBooks = data.books.filter(book => {
            return book.title.toLowerCase().indexOf(request.bookName.toLowerCase()) == 0;
          });
		  if (filteredBooks.length > 0 ) {
			  filteredBooks.sort((a, b) => b.rating.average - a.rating.average); 
			  const book = filteredBooks[0];
			  sendResponse({
				title: book.title,
				isbn13: book.isbn13,
				isbn10: book.isbn10,
				author: book.author,
				author_intro: book.author_intro,
				url: "https://book.douban.com/subject/" + book.id,
				translator: book.translator,
				rating: book.rating,
				summary: book.summary,
				image: book.image
			  });
		  } else {
			  sendResponse({error: "未找到相关书籍"});
		  }
        } else {
          sendResponse({error: "未找到相关书籍"});
        }
      })
      .catch(error => {
        console.error('Error:', error);
        sendResponse({error: error.toString()});
      });
    return true;
  }
});
