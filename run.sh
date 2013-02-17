export NODE_HOME="/home/shreyaspurohit/.nvm/v0.8.15/bin/node"
export SEM_LINK_HOME="/home/shreyaspurohit/Project/Node.JS/node_sample_app"
cd $SEM_LINK_HOME
forever -l $SEM_LINK_HOME/log/forever.app.log -o $SEM_LINK_HOME/log/forever.out.log -e $SEM_LINK_HOME/log/forever.err.log --pidFile $SEM_LINK_HOME/log/forever.app.pid start ./run.js --MONGO_DB_HOST localhost --MONGO_DB_PORT 27017 --MONGO_DB_NAME exampleDB
