## requirements.txt

```python
# 方法一
pip freeze > requirements.txt

# 方法二
pip install pip-tools
pip-compile

# 方法三
#pip install pipreqs
#pipreqs ./ --force --ignore .\my-hls-test\,.\.venv\

# 方法四
conda create --name <env> --file requirements.txt


pip install -r requirements.txt
```





