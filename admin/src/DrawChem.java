
import org.openscience.cdk.interfaces.*;
import org.openscience.cdk.silent.SilentChemObjectBuilder;
import org.openscience.cdk.smiles.SmilesParser;
import org.openscience.cdk.depict.DepictionGenerator;
 
public class DrawChem {
    public static void main(String[] args) {
        if (args.length > 3) System.exit(-1);
        
        String path = args[0];
        String c_number = args[1];
        String smiles = args[2];
        
        if (c_number.length() == 0 || smiles.length() == 0){
            System.exit(0);
        }
    
        try {
        
            IChemObjectBuilder bldr = SilentChemObjectBuilder.getInstance();
            SmilesParser smipar = new SmilesParser(bldr);
            IAtomContainer mol = smipar.parseSmiles(smiles);
            DepictionGenerator dptgen = new DepictionGenerator();
            
            dptgen.depict(mol).writeTo(path + "/../../images/metabolites/C" + c_number + ".png");
        }
        catch(Exception e){
            System.exit(-2);
        }
        finally {
            System.exit(0);
        }
    }
}