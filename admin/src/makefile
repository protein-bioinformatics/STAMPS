BIN_PATH = ../../cgi-bin

main: nodes proteins search edges pathways counter
	javac -cp ../cgi-bin/cdk-2.0.jar:. DrawChem.java && mv DrawChem.class ../cgi-bin/.

nodes:
	g++ -mpopcnt -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-nodes.bin get-nodes.cpp sais.cpp wavelet.cpp rank.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient -lsqlite3 -lz
	
proteins:
	g++ -mpopcnt -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-proteins.bin get-proteins.cpp sais.cpp wavelet.cpp rank.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient -lsqlite3 -lz
	
search:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o ../../cgi-bin/get-search-data.bin get-search-data.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient -lz

edges:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-edges.bin get-edges.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient
	
pathways:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-pathways.bin get-pathways.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient

counter:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/set-counter.bin set-counter.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient
