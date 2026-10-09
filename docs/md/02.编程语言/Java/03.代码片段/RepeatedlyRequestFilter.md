```java
public class doRepeatedlyRequestFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        StringBuilder sb = new StringBuilder();
        BufferedReader reader = null;
        try (InputStream inputStream = request.getInputStream())
        {
            reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
            String line = "";
            while ((line = reader.readLine()) != null)
            {
                sb.append(line);
            }
        }
        catch (IOException e)
        {

        }
        finally
        {
            if (reader != null)
            {
                try
                {
                    reader.close();
                }
                catch (IOException e)
                {

                }
            }
        }

        String body = sb.toString();

        byte[] jsonBytes = body.getBytes("utf-8");
        final ByteArrayInputStream bis = new ByteArrayInputStream(jsonBytes);

        HttpServletRequestWrapper newWrapper = new HttpServletRequestWrapper(request) {

            @Override
            public String[] getParameterValues(String name) {
                return super.getParameterValues(name);
            }

            @Override
            public ServletInputStream getInputStream() throws IOException {
                final ByteArrayInputStream bis = new ByteArrayInputStream(jsonBytes);
                return new ServletInputStream() {
                    @Override
                    public boolean isFinished()
                    {
                        return false;
                    }

                    @Override
                    public boolean isReady()
                    {
                        return true;
                    }

                    @Override
                    public int available() throws IOException
                    {
                        return jsonBytes.length;
                    }

                    @Override
                    public void setReadListener(ReadListener readListener)
                    {
                    }

                    @Override
                    public int read() throws IOException
                    {
                        return bis.read();
                    }
                };
            }
        };

        filterChain.doFilter(newWrapper, servletResponse);
    }
}
```

