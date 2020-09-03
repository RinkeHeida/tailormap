package nl.b3p.viewer.stripes;

import net.sourceforge.stripes.action.*;
import nl.b3p.viewer.config.forms.Form;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONArray;
import org.json.JSONObject;
import org.stripesstuff.stripersist.Stripersist;

import javax.persistence.EntityManager;
import java.io.StringReader;
import java.util.List;

@UrlBinding("/action/form")
@StrictBinding
public class FormActionBean implements ActionBean {

    private static final Log log = LogFactory.getLog(FormActionBean.class);
    private ActionBeanContext context;

    @DefaultHandler
    public Resolution configs(){
        EntityManager em = Stripersist.getEntityManager();
        List<Form> forms = em.createQuery("FROM Form", Form.class).getResultList();
        JSONObject fts = new JSONObject();
        for (Form form : forms) {
            if(form.getJson() != null && !form.getJson().isEmpty()){
                fts.put(form.getFeatureTypeName(), new JSONObject(form.getJson()));
            }
        }

        JSONObject config = new JSONObject();
        config.put("config", fts);
        return new StreamingResolution("application/json", new StringReader(config.toString()));
    }

    @Override
    public ActionBeanContext getContext() {
        return context;
    }

    @Override
    public void setContext(ActionBeanContext context) {
        this.context = context;
    }
}