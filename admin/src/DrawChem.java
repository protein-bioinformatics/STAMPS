
import org.openscience.cdk.interfaces.*;
import org.openscience.cdk.silent.SilentChemObjectBuilder;
import org.openscience.cdk.smiles.SmilesParser;
import org.openscience.cdk.depict.DepictionGenerator;
import java.io.*;
import java.awt.image.*;
import java.util.*;
import javax.imageio.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

 
public class DrawChem {
    
    public static String strip(String str){
        while (str.length() > 0 && (str.charAt(0) == ' ' || str.charAt(0) == 13 || str.charAt(0) == 10)){
            str = str.substring(1);
        }
        int l = str.length();
        while (l > 0 && (str.charAt(l - 1) == ' ' || str.charAt(l - 1) == 13 || str.charAt(l - 1) == 10)){
            str = str.substring(0, l - 1);
            --l;
        }
        return str;
    }
    
    public static HashMap<String, String> read_config_file(String filename){
        HashMap<String, String> m = new HashMap<>();
        try {
            Scanner scanner = new Scanner(new File(filename));
            while (scanner.hasNextLine()) {
                String line = strip(scanner.nextLine());
                if (line.charAt(0) == '#') continue;
                String[] tokens = line.split("=");
                if (tokens.length < 2) continue;
                String key = strip(tokens[0]);
                String value = strip(tokens[1]);
                m.put(key, value);
            
			}
			scanner.close();
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
        return m;
    }
    
    public static void main(String[] args) {
        if (args.length < 2) System.exit(-1);
        
        HashMap<String, String> parameters = read_config_file("../qsdb.conf");
        
        
        String metabolite_id = args[0];
        String smiles = args[1];
    
        try {
        
            IChemObjectBuilder bldr = SilentChemObjectBuilder.getInstance();
            SmilesParser smipar = new SmilesParser(bldr);
            IAtomContainer mol = smipar.parseSmiles(smiles);
            DepictionGenerator dptgen = new DepictionGenerator();
            
            BufferedImage bi = dptgen.depict(mol).toImg();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            File f = new File("test.png");
            ImageIO.write(bi, "png", baos);
            String encoded_img = Base64.getEncoder().encodeToString(baos.toByteArray());
            
            
            
            // Connect with the database
            //Class.forName("com.mysql.jdbc.Driver");
            
            String pattern = "jdbc:mysql://%s:%s/%s?useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=UTC&user=%s&password=%s";
            
            String connect_string = String.format(pattern, parameters.get("mysql_host"), parameters.get("mysql_port"), parameters.get("mysql_db"), parameters.get("mysql_user"), parameters.get("mysql_passwd"));
            
            Connection connect = DriverManager.getConnection(connect_string);
            PreparedStatement preparedStatement = connect.prepareStatement("UPDATE metabolites SET image = ? WHERE id = ?;");
            
            preparedStatement.setString(1, encoded_img);
            preparedStatement.setString(2, metabolite_id);
            preparedStatement.executeUpdate();
        
            
        }
        catch(Exception e){
            e.printStackTrace(System.out);
            System.exit(-2);
        }
        finally {
            System.exit(0);
        }
    }
}
