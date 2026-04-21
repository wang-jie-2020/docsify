# IO

>内存 <-> 硬盘 。
>
>字节、字符
>
>Buffer



| 抽象基类 | 字节流       | 字符流 |
| -------- | ------------ | ------ |
| 输入流   | InputStream  | Reader |
| 输出流   | OutputStream | Writer |

Java中的IO流类都是从表格中4个基类派生的，由它们派生的子类名称都以其父类为名字后缀，如FileReader等



1、按数据类型分类

- 字节流（Byte Stream）：以字节为单位读写数据，适用于处理二进制数据，如图像、音频、视频等。常见的字节流类有`InputStream`和`OutputStream`。
- 字符流（Character Stream）：以字符为单位读写数据，适用于处理文本数据。字符流会自动进行字符编码和解码，可以处理多国语言字符。常见的字符流类有`Reader`和`Writer`。

2、按流的方向分类

- 输入流（Input Stream）：用于读取数据。输入流从数据源读取数据，如文件、网络连接等。常见的输入流类有`FileInputStream`、`ByteArrayInputStream`、`SocketInputStream`等。
- 输出流（Output Stream）：用于写入数据。输出流将数据写入到目标地，如文件、数据库、网络等。常见的输出流类有`FileOutputStream`、`ByteArrayOutputStream`、`SocketOutputStream`等。



1、字节流类

- `InputStream`：用于从输入源读取字节数据的抽象类。

- `FileInputStream`：从文件中读取字节数据的类。

- `ByteArrayInputStream`：从字节数组中读取字节数据的类。

- `BufferedInputStream`：提供缓冲功能的字节输入流类。

- `DataInputStream`：读取基本数据类型的字节输入流类。


2、字符流类

- `Reader`：用于从输入源读取字符数据的抽象类。
- `FileReader`：从文件中读取字符数据的类。
- `BufferedReader`：提供缓冲功能的字符输入流类。
- `InputStreamReader`：将字节流转换为字符流的类。



![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/41e190a5dd434f45a023d73faae93494.jpeg)







