```java
import com.alibaba.fastjson2.JSON;

import java.io.*;
import java.net.*;

public class UrlConnectionHelper {

    /**
     * get请求
     *
     * @param urlParam 接口地址
     * @return
     */
    public static String sendGet(String urlParam) {
        String result = null;
        try {
            //创建url
            URL url = new URL(urlParam);
            //打开连接（返回值是URLConnection强转为子类HttpURLConnection方便操作）
            HttpURLConnection httpURLConnection = (HttpURLConnection) url.openConnection();
            //设置请求方法类型，必须是大写，否则java.net.ProtocolException: Invalid HTTP method: get，也可以使用HttpMethod.GET.name()枚举类，如果有调用getOutputStream()方法那么会自动把GET请求改为POST请求
            httpURLConnection.setRequestMethod("GET");
            //设置建立连接超时时长，0表示不超时，单位毫秒
            httpURLConnection.setConnectTimeout(3000);
            //设置读取数据超时时长即获取接口返回数据超时时长（包含被调用接口的处理业务时长和数据传输回来的时长，网络没问题的情况下基本都是接口处理时长），0表示不超时，单位毫秒
            httpURLConnection.setReadTimeout(5000);
            //开启缓存，默认为 true
            httpURLConnection.setUseCaches(true);
            //设置是否可以向HttpURLConnection输出数据
            httpURLConnection.setDoOutput(false);
            //设置是否可以从HttpUrlConnection读取数据（比如读取应答码、消息、数据等）默认true，如果为false读取数据则会java.net.ProtocolException: Cannot read from URLConnection if doInput=false (call setDoInput(true))
            httpURLConnection.setDoInput(true);
            //设置此 HttpURLConnection 实例是否支持重定向，默认为 setFollowRedirects 方法设置的值，HttpURLConnection.setFollowRedirects(false)，是静态方法是针对所有请求的设置而不是单个请求的设置
            httpURLConnection.setInstanceFollowRedirects(false);
            //建立连接，只是建立一个连接，并不会发送数据，显示建立连接，一般不会写这句代码
            httpURLConnection.connect();
            //读取应答状态码
            int responseCode = httpURLConnection.getResponseCode();
            System.out.println("get请求应答状态码：" + responseCode);
            //读取应答消息
            String responseMessage = httpURLConnection.getResponseMessage();
            System.out.println("get请求应答消息：" + responseMessage);
            //获取输入流，会隐式建立连接，因此就不需要connect()显示建立连接
            InputStream inputStream = httpURLConnection.getInputStream();
            //将返回的数据流转为字符串数据
            result = parseIstoString(inputStream);
            //关闭流
            inputStream.close();
            //断开连接释放资源
            httpURLConnection.disconnect();
            System.out.println("HttpURLConnection GET 接口请求结果：" + result);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }

    /**
     * post请求
     *
     * @param urlParam 接口地址
     * @param body     请求参数
     * @return
     */
    public static String sendPost(String urlParam, Object body) {
        String result = null;
        try {
            //创建url
            URL url = new URL(urlParam);
            //打开连接（返回值是URLConnection强转为子类HttpURLConnection方便操作）
            HttpURLConnection httpURLConnection = (HttpURLConnection) url.openConnection();
            //设置请求方法类型，必须是大写，否则java.net.ProtocolException: Invalid HTTP method: get，也可以使用HttpMethod.POST.name()枚举类
            httpURLConnection.setRequestMethod("POST");
            //设置建立连接超时时长，0表示不超时，单位毫秒
            httpURLConnection.setConnectTimeout(3000);
            //设置读取数据超时时长即获取接口返回数据超时时长（包含被调用接口的处理业务时长和数据传输回来的时长，网络没问题的情况下基本都是接口处理时长），0表示不超时，单位毫秒
            httpURLConnection.setReadTimeout(5000);
            //开启缓存，默认为 true
            httpURLConnection.setUseCaches(true);
            //设置是否可以向HttpURLConnection输出数据，对于post请求，参数要放在 http 正文body内，因此需要设为true，默认为false报错java.net.ProtocolException: cannot write to a URLConnection if doOutput=false - call setDoOutput(true)
            httpURLConnection.setDoOutput(true);
            //设置是否可以从HttpUrlConnection读取数据（比如读取应答码、消息、数据等）默认true，如果为false读取数据则会java.net.ProtocolException: Cannot read from URLConnection if doInput=false (call setDoInput(true))
            httpURLConnection.setDoInput(true);
            //设置此 HttpURLConnection 实例是否支持重定向，默认为 setFollowRedirects 方法设置的值，HttpURLConnection.setFollowRedirects(false)，是静态方法是针对所有请求的设置而不是单个请求的设置
            httpURLConnection.setInstanceFollowRedirects(false);
            //设置header参数，请求数据类型为json
            httpURLConnection.setRequestProperty("Content-Type", "application/json");
            //保持长连接，方便复用连接
            httpURLConnection.setRequestProperty("Connection", "Keep-Alive");
            //获取输出流，会隐式建立连接，因此就不需要connect()显示建立连接，往body中写入数据
            OutputStream outputStream = httpURLConnection.getOutputStream();
            System.out.println("请求post接口参数：" + JSON.toJSONString(body));
            //写入参数时需要字符串的字节数据，由于service的接口要求json格式的数据，因此需要转为json字符串
            outputStream.write(JSON.toJSONString(body).getBytes());
            //刷掉缓存，防止数据未写入完毕
            outputStream.flush();
            //关闭流
            outputStream.close();
            //建立连接，只是建立一个连接，并不会发送数据，显示建立连接，一般不会写这句代码
            httpURLConnection.connect();
            //读取应答状态码
            int responseCode = httpURLConnection.getResponseCode();
            System.out.println("get请求应答状态码：" + responseCode);
            //读取应答消息
            String responseMessage = httpURLConnection.getResponseMessage();
            System.out.println("get请求应答消息：" + responseMessage);
            //获取输入流，会隐式建立连接，因此就不需要connect()显示建立连接
            InputStream inputStream = httpURLConnection.getInputStream();
            //将返回的数据流转为字符串数据
            result = parseIstoString(inputStream);
            //关闭流
            inputStream.close();
            //断开连接释放资源
            httpURLConnection.disconnect();
            System.out.println("HttpURLConnection GET 接口请求结果：" + result);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return result;
    }

    /**
     * 将流数据转换为字符串工具方法
     *
     * @param is
     * @return
     */
    public static String parseIstoString(InputStream is) {
        //用于组装字符串数据
        StringBuilder stringBuilder = new StringBuilder();
        //将流数据转为BufferedReader对象读取数据
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(is));
        String line = null;
        try {
            while (null != (line = bufferedReader.readLine())) {
                stringBuilder.append(line);
            }
            //关闭流
            bufferedReader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return stringBuilder.toString();
    }
}
```