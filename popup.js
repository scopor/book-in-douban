document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (chrome.runtime.lastError) {
      showError("查询当前标签页时出错: " + chrome.runtime.lastError.message);
      return;
    }
    if (tabs.length === 0) {
      showError("未找到当前标签页");
      return;
    }
    chrome.tabs.executeScript(
      tabs[0].id,
      { code: 'window.getSelection().toString();' },
      function(selection) {
        if (chrome.runtime.lastError) {
          showError("获取选中文本时出错: " + chrome.runtime.lastError.message);
        } else if (selection && selection[0]) {
          searchBook(selection[0]);
        } else {
          showError("请先在页面上选择书名，然后再点击插件图标。");
        }
      }
    );
  });
});

function searchBook(bookName) {
  showLoading("正在搜索...");
  chrome.runtime.sendMessage({action: "getBookInfo", bookName: bookName.trim()}, function(response) {
    if (chrome.runtime.lastError) {
      showError("获取信息时出错: " + chrome.runtime.lastError.message);
    } else if (response.error) {
      showError("获取信息时出错: " + response.error);
    } else {
      displayBookInfo(response);
    }
  });
}

function displayBookInfo(bookInfo) {
  console.log(bookInfo.url);
  document.getElementById('bookTitle').textContent = bookInfo.title;
  document.getElementById("bookPath").href = bookInfo.url; 
  document.getElementById('author').textContent = "作者: " + bookInfo.author.join('，') + "。 " + bookInfo.author_intro;
  document.getElementById('translator').textContent = "译者: " + (bookInfo.translator ? bookInfo.translator.join('，') : "无");
  document.getElementById('bookISBN').textContent = "ISBN: " + (bookInfo.isbn13 || bookInfo.isbn10 || "未知");
  document.getElementById('bookRating').textContent = "评分: " + (bookInfo.rating ? bookInfo.rating.average : "未知");
  document.getElementById('bookSummary').textContent = "简介: " + (bookInfo.summary || "暂无");
  document.getElementById('bookCover').src = bookInfo.image || "";
  
  document.getElementById('result').textContent = "";
  document.getElementById('bookInfo').style.display = "block";
}

function showError(message) {
  document.getElementById('result').textContent = message;
  document.getElementById('bookInfo').style.display = "none";
}

function showLoading(message) {
  document.getElementById('result').textContent = message;
  document.getElementById('bookInfo').style.display = "none";
}
