import { api } from "./api";
const base="/api/exams/";
export const getExam=id=>api(base+"get.php?university_id="+encodeURIComponent(id));
export const getAdminExam=id=>api(base+"admin.php?university_id="+encodeURIComponent(id));
function notify() {
 window.dispatchEvent(new Event("exams-updated"));
 if("BroadcastChannel" in window){const channel=new BroadcastChannel("exams");channel.postMessage("updated");channel.close();}
}
async function mutate(endpoint,method,body){const data=await api(base+endpoint+".php",{method,body});notify();return data;}
export const saveExam=values=>mutate(values.id?"update":"create",values.id?"PUT":"POST",values);
export const deleteExam=(id,university_id)=>mutate("delete","DELETE",{id,university_id});
export const saveExamCategory=values=>mutate(values.id?"category_update":"category_create",values.id?"PUT":"POST",values);
export const deleteExamCategory=(id,exam_id,university_id)=>mutate("category_delete","DELETE",{id,exam_id,university_id});
export function uploadExamImage(file){const body=new FormData();body.append("imagen",file);return api(base+"upload.php",{method:"POST",body});}
