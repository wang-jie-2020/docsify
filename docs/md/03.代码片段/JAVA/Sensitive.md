### 自定义注解标记:自定义注解控制输出(Sensitive敏感信息脱离)

@JacksonAnnotationsInside  内联标记 --> 标记了@Sensitive 就像直接在那个元素上使用了 @JsonSerialize

@JsonSerialize

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
@JacksonAnnotationsInside
@JsonSerialize(using = SensitiveJsonSerializer.class)
public @interface Sensitive
{
    // 枚举
    DesensitizedType desensitizedType();
}
```

```java
/**
 * 数据脱敏序列化过滤
 *   有个细节: 已经在需要特殊处理的字段上标注了@JsonSerialize(using = SensitiveJsonSerializer.class),为什么还需要ContextualSerializer?
 *      尝试注释掉接口,一样可以断到..问题在于无法拿到注解
 *
 */
public class SensitiveJsonSerializer extends JsonSerializer<String> implements ContextualSerializer
{
    private DesensitizedType desensitizedType;

    @Override
    public void serialize(String value, JsonGenerator gen, SerializerProvider serializers) throws IOException
    {
        // s -> func(s)
        gen.writeString(desensitizedType.desensitizer().apply(value));
    }

    @Override
    public JsonSerializer<?> createContextual(SerializerProvider prov, BeanProperty property)
            throws JsonMappingException
    {
        Sensitive annotation = property.getAnnotation(Sensitive.class);
        if (Objects.nonNull(annotation) && Objects.equals(String.class, property.getType().getRawClass()))
        {
            this.desensitizedType = annotation.desensitizedType();
            return this;
        }
        return prov.findValueSerializer(property.getType(), property);
    }
}
```

