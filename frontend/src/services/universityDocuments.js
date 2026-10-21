import { api } from "./api";
import { uploadPdf, savePdfResource } from "./pdfUpload.js";
const base="/api/university-documents/";
export const listUniversityDocuments=id=>api(base+"list.php?university_id="+encodeURIComponent(id));
export const listAdminUniversityDocuments=id=>api(base+"admin.php?university_id="+encodeURIComponent(id));
function notify(){
 window.dispatchEvent(new Event("university-documents-updated"));
 if("BroadcastChannel" in window){const c=new BroadcastChannel("university-documents");c.postMessage("updated");c.close();}
}
export async function saveUniversityDocument(values){const row=await savePdfResource(base+(values.id?"update.php":"create.php"),{method:values.id?"PUT":"POST",body:values});notify();return row;}
export async function deleteUniversityDocument(id,university_id){await api(base+"delete.php",{method:"DELETE",body:{id,university_id}});notify();}
export async function uploadUniversityDocument(file,onProgress){
 const result=await uploadPdf(base+"upload.php",file,onProgress);
 return {archivo:result.documento,documento_nombre:result.documento_nombre};
}
