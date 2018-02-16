BIN_PATH = ../../cgi-bin

main:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-edges.bin get-edges.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient
	g++ -mpopcnt -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-nodes.bin get-nodes.cpp sais.cpp wavelet.cpp rank.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient -lsqlite3 -lz
	g++ -mpopcnt -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-proteins.bin get-proteins.cpp sais.cpp wavelet.cpp rank.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient -lsqlite3 -lz
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-pathways.bin get-pathways.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/set-counter.bin set-counter.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlclient
	javac -cp ../../cgi-bin/cdk-2.0.jar:. DrawChem.java && mv DrawChem.class ../../cgi-bin/.
