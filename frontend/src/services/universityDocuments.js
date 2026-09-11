import { api } from "./api";
const base="/api/university-documents/";
export const listUniversityDocuments=id=>api(base+"list.php?university_id="+encodeURIComponent(id));
export const listAdminUniversityDocuments=id=>api(base+"admin.php?university_id="+encodeURIComponent(id));
function notify(){
 window.dispatchEvent(new Event("university-documents-updated"));
 if("BroadcastChannel" in window){const c=new BroadcastChannel("university-documents");c.postMessage("updated");c.close();}
}
export async function saveUniversityDocument(values){const row=await api(base+(values.id?"update.php":"create.php"),{method:values.id?"PUT":"POST",body:values});notify();return row;}
export async function deleteUniversityDocument(id,university_id){await api(base+"delete.php",{method:"DELETE",body:{id,university_id}});notify();}
export async function uploadUniversityDocument(file){
 const body=new FormData();body.append("documento",file);
 const result=await api(base+"upload.php",{method:"POST",body});
 return {archivo:result.documento,documento_nombre:result.documento_nombre};
}
