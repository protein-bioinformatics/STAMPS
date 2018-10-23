BIN_PATH = ../../scripts
ADMIN_PATH = ../scripts

main: nodes proteins search edges pathways manage chromosomes
	javac -cp ../scripts/cdk-2.0.jar:. DrawChem.java && mv DrawChem.class ../scripts/.

nodes:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-nodes.bin get-nodes.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlcppconn -lz
	
proteins:
	g++ -mpopcnt -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-proteins.bin get-proteins.cpp sais.cpp wavelet.cpp rank.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlcppconn -lsqlite3 -lz
	
search:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-search-data.bin get-search-data.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlcppconn -lz

edges:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-edges.bin get-edges.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlcppconn -lz
	
pathways:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-pathways.bin get-pathways.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlcppconn -lz

manage:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(ADMIN_PATH)/manage-entries.bin manage-entries.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlcppconn -lz

chromosomes:
	g++ -std=c++11 -O3 -I/usr/include/mysql -o $(BIN_PATH)/get-chromosomes.bin get-chromosomes.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu -lmysqlcppconn -lz

