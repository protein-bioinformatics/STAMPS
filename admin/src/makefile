BIN_PATH = ../../cgi-bin

main:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-edges.bin get-edges.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-nodes.bin get-nodes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-pathways.bin get-pathways.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/set-counter.bin set-counter.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient

