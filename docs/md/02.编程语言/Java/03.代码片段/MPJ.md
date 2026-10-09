```java
MPJLambdaWrapper<DataServer> wrapper = MPJWrappers.<DataServer>lambdaJoin()
    .leftJoin(DataFolder.class, DataFolder::getServerId, DataServer::getId)
    .leftJoin(DataFile.class, DataFile::getFolderId, DataFolder::getId)
    .eq(DataServer::getId, id)

    .selectAll(DataServer.class)
    .selectCollection(DataFolder.class, ServerVo::getFolders,
                      f -> f.collection(DataFile.class, FolderVo::getFiles));

ServerVo result = dataServerMapper.selectJoinOne(ServerVo.class, wrapper);
return new ResponseEntity<>(result, HttpStatus.OK);
```

