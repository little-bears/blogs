# 1、宝塔面板计划任务自动备份mongodb数据库shell代码：

## 指定到你安装的Mongodb bin目录下的mongodump
dump=/www/server/mongodb/bin/mongodump
## 填写你创建dump_bak文件的绝对路径
out_dir=/www/backup/database/dump_bak
## 填写你创建tar_bak文件的绝对路径
tar_dir=/www/backup/database/tar_bak
## 记录备份时间
sysdate=`date +%Y%m%d_%H%M%S`
## 设置删除期限，删除30天前的备份
days=7
## 设置最终压缩的文件名称，带有日期
tar_bak="mondodb_bak_$sysdate.tar.gz"

if [ -d $out_dir ];then
  cd $out_dir
else
  ## "文件夹不存在"
  sudo mkdir -p $out_dir
  cd $out_dir
fi

if [ ! -d $tar_dir ];then
  ## "文件夹不存在"
  sudo mkdir -p $tar_dir
fi


# 删除之前的dump文件
sudo rm -rf $out_dir/*
# 创建新的文件夹存放dump文件
sudo mkdir -p $out_dir/$sysdate
# 导出127.0.0.1机器上的blog库的所有表到$out_dir/$sysdate文件夹
$dump -h 127.0.0.1 -d blog -o $out_dir/$sysdate
# 压缩$out_dir/$sysdate到目标文件夹
sudo tar -zcvf $tar_dir/$tar_bak $out_dir/$sysdate
# 删除指定期限钱的备份文件
sudo find $tar_dir/ -mtime +$days -delete

echo "===数据库: blog 备份完成==="
# 退出
exit

# 2、数据库恢复:
mongorestore -h 127.0.0.1 -d blog2 --dir blog
