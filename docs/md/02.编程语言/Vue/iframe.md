## 限制

1. X-Frame-Options

   X-Frame-Options 是一种安全策略，可以由网站的服务器设置，用于控制页面是否允许在 iframe 中嵌套。当网站设置了 X-Frame-Options 为 `DENY` 或 `SAMEORIGIN`，浏览器将不允许将该页面在 iframe 中加载，以防止点击劫持等安全问题。

2. cookie

   浏览器限制了通过 iframe 中的页面使用 `set-cookie` 标头来设置 Cookie。这是出于安全考虑，防止跨域 Cookie 污染攻击。当在 iframe 中加载一个来自不同域的页面时，该页面无法通过设置 `set-cookie` 标头来在主页面的域中设置 Cookie。

   这种限制是由同源策略 (Same-Origin Policy) 引起的，它要求网页只能访问来自相同域的资源。Cookie 是一种用于跟踪会话状态和存储用户数据的机制，在跨域的情况下，Cookie 可能被恶意网站滥用，因此浏览器禁止了在跨域 。

3. iframe中跳转

   通常出现在浏览器中，涉及到对 iframe 进行跳转的操作。这是由于浏览器的安全机制，阻止当前窗口在 iframe 中导航到其他域名的页面，以防止潜在的安全风险。

4. http无法嵌入https



## 跨域通信

1. postMessage

   HTML5 引入的 ‌**跨文档通信（Cross-Document Messaging）**‌ API，允许不同源（协议、域名、端口）的窗口或 iframe 安全地交换消息。

   ```js
   <iframe id="child" src="https://child-domain.com"></iframe>
   <script>
     const iframe = document.getElementById("child");
     window.addEventListener("message", (e) => {
       if (e.origin === "https://child-domain.com") {
         console.log("来自子页面:", e.data);
       }
     });
   
     iframe.onload = () => {
       iframe.contentWindow.postMessage("Hello from parent", "https://child-domain.com");
     };
   </script>
   ```

   ```js
   <script>
     window.addEventListener("message", (e) => {
       if (e.origin === "https://parent-domain.com") {
         e.source.postMessage("Hello from child", e.origin);
       }
     });
   </script>
   ```

   