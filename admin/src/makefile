BIN_PATH = ../../scripts
ADMIN_PATH = ../scripts

#INC = -I/usr/include/mysql
INC = 
#LIBS = -lsqlite3 -lmysqlcppconn -lz -lpthread -lcurl
LIBS = -lsqlite3 -lz -lpthread -lcurl

main: nodes proteins search edges pathways manage chromosomes prep_blib create_blib cdk
	echo "done"
	
cdk:
	javac -cp ../scripts/cdk-2.0.jar:. DrawChem.java && mv DrawChem.class ../scripts/.

nodes:
	g++ -std=c++11 -O3 $(INC) -o $(BIN_PATH)/get-nodes.bin get-nodes.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu $(LIBS) 
	
proteins:
	g++ -mpopcnt -std=c++11 $(INC) -o $(BIN_PATH)/get-proteins.bin get-proteins.cpp sais.cpp wavelet.cpp rank.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu $(LIBS)
	
search:
	g++ -std=c++11 -O3 $(INC) -o $(BIN_PATH)/get-search-data.bin get-search-data.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu $(LIBS)

edges:
	g++ -std=c++11 -O3 $(INC) -o $(BIN_PATH)/get-edges.bin get-edges.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu $(LIBS)
	
pathways:
	g++ -std=c++11 -O3 $(INC) -o $(BIN_PATH)/get-pathways.bin get-pathways.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu $(LIBS)

manage:
	g++ -std=c++11 -O3 $(INC) -o $(ADMIN_PATH)/manage-entries.bin manage-entries.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu $(LIBS)

chromosomes:
	g++ -std=c++11 -O3 $(INC) -o $(BIN_PATH)/get-chromosomes.bin get-chromosomes.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu $(LIBS)

prep_blib:
	g++ -std=c++11 -O3 $(INC) -o $(ADMIN_PATH)/prepare-blib.bin prepare-blib.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu $(LIBS)
	
create_blib:
	g++ -std=c++11 -O3 $(INC) -o $(ADMIN_PATH)/create-blib.bin create-blib.cpp bio-classes.cpp -L/usr/lib/x86_64-linux-gnu $(LIBS)
