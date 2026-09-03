## 示例

```nginx
stream {
    server {
        listen 5006;
        proxy_pass 127.0.0.1:1521;
    }
	
	server {
        listen 5007;
        proxy_pass 127.0.0.1:6379;
    }
}
```



```nginx
#server {
#	listen       80;
#	server_name  xx.xx.xx;
#	return 301 https://$host$request_uri;
#}

#server ｛
#  listen 80 default_server;
#  server_name _;
#  return 403;	# 这里是在接收到ip访问或非指定域名访问时会返回403错误
#｝

server {
		listen 		 80;
        #listen       443 ssl;
        #server_name  xx.xx.xx;
                
		#ssl_certificate      xx.pem;
		#ssl_certificate_key  xx.key;

		#ssl_session_cache    shared:ssl:1m;
		#ssl_session_timeout  5m;

		#ssl_ciphers  high:!anull:!md5;
		#ssl_prefer_server_ciphers  on; 
		
		location /api/ {
			proxy_pass http://127.0.0.1:15005/api/;
			proxy_http_version 1.1;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection keep-alive;
			proxy_set_header Host $http_host;
			proxy_cache_bypass $http_upgrade;
			client_max_body_size 500m;  
		}	
		
		location /Galileo4Sap.asmx {
			proxy_pass http://127.0.0.1:15005;
			proxy_http_version 1.1;
			proxy_set_header Upgrade $http_upgrade;
			proxy_set_header Connection keep-alive;
			proxy_set_header Host $http_host;
			proxy_cache_bypass $http_upgrade;
			client_max_body_size 500m;  
		} 
		
        location / {
            proxy_pass http://127.0.0.1:15008;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection keep-alive;
            proxy_set_header Host $http_host;
			#add_header Content-Security-Policy upgrade-insecure-requests;
            proxy_cache_bypass $http_upgrade;
            client_max_body_size 500m;            
        }
}
```



## 配置

### server_name

**server_name中可以包含通配符、正则表达式，匹配级别有不同**

| server_name与Host的匹配优先级             |                       |
| ----------------------------------------- | --------------------- |
| 首先选择所有字符串完全匹配的server_name   | 如：www.testwab.com   |
| 其次选择通配符在前面的server_name         | 如：*.testwab.com     |
| 其次选择通配符在后面的server_name         | 如：www.testwab.*     |
| 最后选择使用正在表达式才匹配的server_name | 如：~^\.testwab\.com$ |

### location

location 语法： location [=|~|~*|^~] /uri/ { ... }

= 严格的相等

~ 区分大小写匹配

~* 不区分大小写匹配

其他的参照正则表达式即可



**注意：**

**location时有顺序的，当一个请求有可能匹配多个location时，实际上这个请求会被第一个location处理**

**location处的正则匹配可以获取的（比如http：xxx?url='return.com'，中url可以通过正则匹配后获取url转发）**



location、proxy_pass决定了如何转发一个完整的url地址:

1. location是否包含通配、正则等, /webapi/ 与 /webapi 明显后者会更多匹配到 /webapi123...
2. proxy_pass
   1. **只写到域名/端口**，不带 URI 路径，则原始请求 URI 原样转发；*
   2. **带了 URI 路径**，`/`*、*`/api/`*，则 Nginx 会把匹配到的* `location` *前缀替换成这个 URI 路径。*

```nginx
location /webapi/ {
    proxy_pass http://localhost:9000;	# http://example.com/webapi/user/list -> http://localhost:9000/webapi/user/list
}	

location /webapi/ {
    proxy_pass http://localhost:9000/;	# http://example.com/webapi/user/list -> http://localhost:9000/user/list
}
```

### 高可用性

即nginx出现异常或者服务器宕机时，以一个备用的服务器承载。采用的工具是keepalive，这个暂未深入。

nginx中文网站：https://www.nginx.cn/doc/index.html

### 配置解释

```bash
##代码块中的events、http、server、location、upstream等都是块配置项##
##块配置项可以嵌套。内层块直接继承外层快，例如：server块里的任意配置都是基于http块里的已有配置的##

##Nginx worker进程运行的用户及用户组 
#语法：user username[groupname]    默认：user nobody nobody
#user用于设置master进程启动后，fork出的worker进程运行在那个用户和用户组下。当按照"user username;"设置时，用户组名与用户名相同。
#若用户在configure命令执行时，使用了参数--user=usergroup 和 --group=groupname,此时nginx.conf将使用参数中指定的用户和用户组。
#user  nobody;

##Nginx worker进程个数：其数量直接影响性能。
#每个worker进程都是单线程的进程，他们会调用各个模块以实现多种多样的功能。如果这些模块不会出现阻塞式的调用，那么，有多少CPU内核就应该配置多少个进程，反之，有可能出现阻塞式调用，那么，需要配置稍多一些的worker进程。
worker_processes  1;
 
##ssl硬件加速。
#用户可以用OpneSSL提供的命令来查看是否有ssl硬件加速设备：openssl engine -t
#ssl_engine device;
 
##守护进程(daemon)。是脱离终端在后台允许的进程。它脱离终端是为了避免进程执行过程中的信息在任何终端上显示。这样一来，进程也不会被任何终端所产生的信息所打断。##
##关闭守护进程的模式，之所以提供这种模式，是为了放便跟踪调试nginx，毕竟用gdb调试进程时最繁琐的就是如何继续跟进fork出的子进程了。##
##如果用off关闭了master_proccess方式，就不会fork出worker子进程来处理请求，而是用master进程自身来处理请求
#daemon off;   #查看是否以守护进程的方式运行Nginx 默认是on 
#master_process off; #是否以master/worker方式工作 默认是on
 
##error日志的设置#
#语法： error_log /path/file level;
#默认： error_log / log/error.log error;
#当path/file 的值为 /dev/null时，这样就不会输出任何日志了，这也是关闭error日志的唯一手段；
#leve的取值范围是debug、info、notice、warn、error、crit、alert、emerg从左至右级别依次增大。
#当level的级别为error时，error、crit、alert、emerg级别的日志就都会输出。大于等于该级别会输出，小于该级别的不会输出。
#如果设定的日志级别是debug，则会输出所有的日志，这一数据量会很大，需要预先确保/path/file所在的磁盘有足够的磁盘空间。级别设定到debug，必须在configure时加入 --with-debug配置项。
#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;
 
##pid文件（master进程ID的pid文件存放路径）的路径
#pid        logs/nginx.pid;
 
events {
 #仅对指定的客户端输出debug级别的日志： 语法：debug_connection[IP|CIDR]
 #这个设置项实际上属于事件类配置，因此必须放在events{……}中才会生效。它的值可以是IP地址或者是CIRD地址。
 	#debug_connection 10.224.66.14;  #或是debug_connection 10.224.57.0/24
 #这样，仅仅以上IP地址的请求才会输出debug级别的日志，其他请求仍然沿用error_log中配置的日志级别。
 #注意：在使用debug_connection前，需确保在执行configure时已经加入了--with-debug参数，否则不会生效。
	worker_connections  1024;
}

##核心转储(coredump):在Linux系统中，当进程发生错误或收到信号而终止时，系统会将进程执行时的内存内容(核心映像)写入一个文件(core文件)，以作为调试只用，这就是所谓的核心转储(coredump).
 
http {
		##嵌入其他配置文件 语法：include /path/file
		#参数既可以是绝对路径也可以是相对路径（相对于Nginx的配置目录，即nginx.conf所在的目录）
    include       mime.types;
    default_type  application/octet-stream;
 
    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';
 
    #access_log  logs/access.log  main;
 
    sendfile        on;
    #tcp_nopush     on;
 
    #keepalive_timeout  0;
    keepalive_timeout  65;
 
    #gzip  on;
 			
    server {
      ##listen监听的端口
      #语法：listen address:port [ default(deprecated in 0.8.21) | default_server | [ backlog=num | rcvbuf=size | sndbuf=size | accept_filter=filter | deferred | bind | ssl ] ]
      #default_server: 如果没有设置这个参数，那么将会以在nginx.conf中找到的第一个server块作为默认server块
      listen       8080;
      #主机名称：其后可以跟多个主机名称，开始处理一个HTTP请求时，nginx会取出header头中的Host，与每个server中的server_name进行匹配，以此决定到底由那一个server来处理这个请求。有可能一个Host与多个server块中的server_name都匹配，这时会根据匹配优先级来选择实际处理的server块。server_name与Host的匹配优先级见文末。
     server_name  localhost;

     #charset koi8-r;

      #access_log  logs/host.access.log  main;

      #location / {
      #    root   html;
      #    index  index.html index.htm;
      #}

      ##location 语法： location [=|~|~*|^~] /uri/ { ... }
      # location的使用实例见文末。
      #注意：location时有顺序的，当一个请求有可能匹配多个location时，实际上这个请求会被第一个location处理。
    	location / {
        proxy_pass http://192.168.1.60;
   		}
   }	
}
```

### root & alias

root和alias都可以定义在location模块中，都是用来指定请求资源的真实路径，比如：

```bash
location /i/ {
  root /data/w3;
}
```

请求 `http://foofish.net/i/top.gif`这个地址时，那么在服务器里面对应的真正的资源是` /data/w3/i/top.gif`文件

**注意：**真实的路径是root指定的值加上location指定的值 。



![img](https://cdn.nlark.com/yuque/0/2020/png/1294764/1600321337104-04281d2d-c1c1-42d5-95ee-2f6a8fa37d8d.png)



而 alias 正如其名，alias指定的路径是location的别名，不管location的值怎么写，资源的 **真实路径都是 alias 指定的路径** ，比如：

```bash
location /i/ {  
	alias /data/w3/;
 }
```

同样请求 `http://foofish.net/i/top.gif` 时，在服务器查找的资源路径是：` /data/w3/top.gif`

![img](https://cdn.nlark.com/yuque/0/2020/png/1294764/1600321337085-28f656a7-5689-4c00-a2a7-403d7c0340bb.png)

**其他区别：**

  1、 alias 只能作用在location中，而root可以存在server、http和location中。

   2、alias 后面必须要用 “/” 结束，否则会找不到文件，而 root 则对 ”/” 可有可无。









