import { api } from "./api";
import { uploadPdf, savePdfResource } from "./pdfUpload.js";
const base="/api/academic-offers/";
export const listAcademicOffers=id=>api(base+"list.php?university_id="+encodeURIComponent(id));
export const listAdminAcademicOffers=id=>api(base+"admin.php?university_id="+encodeURIComponent(id));
function notify(){
 window.dispatchEvent(new Event("academic-offers-updated"));
 if("BroadcastChannel" in window){const c=new BroadcastChannel("academic-offers");c.postMessage("updated");c.close();}
}
export async function saveAcademicOffer(values){const row=await savePdfResource(base+(values.id?"update.php":"create.php"),{method:values.id?"PUT":"POST",body:values});notify();return row;}
export async function deleteAcademicOffer(id,university_id){await api(base+"delete.php",{method:"DELETE",body:{id,university_id}});notify();}
export function uploadOfferImage(file){const body=new FormData();body.append("imagen",file);return api(base+"upload_image.php",{method:"POST",body});}
export function uploadOfferDocument(file,onProgress){return uploadPdf(base+"upload_document.php",file,onProgress);}
