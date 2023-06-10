(async () => {
  chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
    if (Object(request).hasOwnProperty("enabled")) {
      chrome.tabs
        .query({
          active: true,
          lastFocusedWindow: true,
        })
        .then((tabs) => tabs[0])
        .then((tab) => {
          if (!tab || !tab.id) return;

          return chrome.tabs.sendMessage(tab.id, request);
        })
        .then(() => {
          sendResponse("Success");
        });
    }
  });
})();
