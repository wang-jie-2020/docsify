```java
import lombok.experimental.var;
import lombok.extern.slf4j.Slf4j;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

@Slf4j
public class doTime {

    public static void main(String[] args) {

    }

    public static void Date() throws ParseException {

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        /// 从字符串转换
        String dateStr = "2023-12-09 14:30:25";
        Date date = dateFormat.parse(dateStr);

        /// 格式化输出
        log.info(dateFormat.format(date));

        /// <-LocalDateTime
        var now = Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
        log.info(now.toString());

        /// <-ZonedDateTime
        now = Date.from(ZonedDateTime.now().toInstant());
        log.info(now.toString());

        /// ->LocalDateTime & ZonedDateTime
        var now1 = new Date().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        log.info(now1.toString());
    }

    public static void DateTime() throws ParseException {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        /// 从字符串转换
        String dateStr = "2023-12-09 14:30:25";
        LocalDateTime date = LocalDateTime.parse(dateStr, formatter);

        /// 格式化输出
        log.info(date.format(formatter));

        var now = new Date().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        log.info(now.toString());

        now = ZonedDateTime.now().toLocalDateTime();
        log.info(now.toString());
    }

    public void Formatter() {
        log.info(new Date().toString());            // Mon Sep 29 13:52:52 CST 2025
        log.info(LocalDateTime.now().toString());   // 2025-09-29T13:52:52.120714900
        log.info(ZonedDateTime.now().toString());   // 2025-09-29T13:52:52.121710100+08:00[Asia/Shanghai]

        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        log.info(dateFormat.format(new Date()));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        log.info(LocalDateTime.now().format(formatter));
        log.info(ZonedDateTime.now().format(formatter));
    }

    public void DateTransfer() {
        var now = Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
        log.info(now.toString());

        now = Date.from(ZonedDateTime.now().toInstant());
        log.info(now.toString());
    }

    public void LocalDateTimeTransfer() {
        var now = new Date().toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        log.info(now.toString());

        now = ZonedDateTime.now().toLocalDateTime();
        log.info(now.toString());
    }
}
```

