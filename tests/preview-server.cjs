// Local browser QA only. All outbound lead delivery is replaced with an in-process mock.
const fs=require('node:fs');const {createServer}=require('../server');
let requests=[];const server=createServer({token:'local-test-only',redirectHosts:false,fetch:async(url,options)=>{
 const body=JSON.parse(options.body);requests.push({formType:body.formType,fields:Object.keys(body.payload),message:body.payload.message||'',info:body.payload.info||''});
 fs.writeFileSync('/private/tmp/skyguard-form-qa.json',JSON.stringify(requests,null,2));
 return new Response(JSON.stringify({ok:true}),{status:body.payload.message?.includes('fail-test')?500:202,headers:{'content-type':'application/json'}});
}});server.listen(4173,'127.0.0.1',()=>console.log('Local SkyGuard preview: http://127.0.0.1:4173 (mock lead delivery only)'));
