import { api } from "./api";
const base="/api/admissions/";
export const getAdmission=id=>api(base+"get.php?university_id="+encodeURIComponent(id));
export const getAdminAdmission=id=>api(base+"admin.php?university_id="+encodeURIComponent(id));
function notify() {
 window.dispatchEvent(new Event("admissions-updated"));
 if("BroadcastChannel" in window){const channel=new BroadcastChannel("admissions");channel.postMessage("updated");channel.close();}
}
async function mutate(endpoint,method,body){const data=await api(base+endpoint+".php",{method,body});notify();return data;}
export const saveAdmission=values=>mutate(values.id?"update":"create",values.id?"PUT":"POST",values);
export const deleteAdmission=(id,university_id)=>mutate("delete","DELETE",{id,university_id});
export const saveAdmissionStep=values=>mutate(values.id?"step_update":"step_create",values.id?"PUT":"POST",values);
export const deleteAdmissionStep=(id,admission_id,university_id)=>mutate("step_delete","DELETE",{id,admission_id,university_id});
export function uploadAdmissionImage(file){const body=new FormData();body.append("imagen",file);return api(base+"upload.php",{method:"POST",body});}
