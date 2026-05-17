const COLORS = ['#4A7BFF','#FF6B6B','#FF9F43','#26de81','#a29bfe','#fd79a8','#00cec9','#6c5ce7'];

const HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>受講生ダッシュボード</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;display:flex;flex-direction:column;height:100vh;overflow:hidden}
header{background:white;padding:14px 24px;border-bottom:1px solid #e0e0e0;font-size:17px;font-weight:700;color:#333;display:flex;align-items:center;gap:12px}
.hdr-btns{margin-left:auto;display:flex;gap:8px;align-items:center}
.hdr-btn{color:white;border:none;padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block}
.bulk-btn{background:#FF9F43}.bulk-btn:hover{background:#e8902e}
.sheet-btn{background:#34A853}
.stats{display:grid;grid-template-columns:repeat(4,1fr);background:white;border-bottom:1px solid #e0e0e0}
.stat{padding:14px;text-align:center;border-right:1px solid #e0e0e0}
.stat-val{font-size:26px;font-weight:700;color:#333}
.stat-lbl{font-size:11px;color:#888;margin-top:2px}
.main{display:grid;grid-template-columns:270px 1fr 250px;flex:1;overflow:hidden}
.list{background:white;border-right:1px solid #e0e0e0;overflow-y:auto;display:flex;flex-direction:column}
.list-hd{padding:12px 16px;font-size:12px;color:#888;border-bottom:1px solid #e0e0e0;font-weight:500;display:flex;align-items:center;justify-content:space-between}
.add-btn{background:#4A7BFF;color:white;border:none;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600}
.sitem{padding:11px 16px;cursor:pointer;border-bottom:1px solid #f5f5f5;display:flex;align-items:center;gap:10px}
.sitem:hover,.sitem.active{background:#f0f4ff}
.av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;flex-shrink:0}
.sinfo{flex:1;min-width:0}
.sname{font-size:13px;font-weight:600;color:#333}
.sstage{font-size:11px;color:#aaa;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pb{height:3px;background:#e8e8e8;border-radius:2px;margin-top:5px}
.pf{height:100%;border-radius:2px;background:#4A7BFF}
.ppct{font-size:11px;color:#888;flex-shrink:0}
.detail{padding:24px;overflow-y:auto;background:#f9f9f9}
.empty{display:flex;align-items:center;justify-content:center;height:100%;color:#bbb;font-size:14px}
.dhead{background:white;border-radius:12px;padding:20px;display:flex;align-items:center;gap:14px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);flex-wrap:wrap}
.dav{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:white;flex-shrink:0}
.dname{font-size:20px;font-weight:700;color:#333}
.dmeta{font-size:12px;color:#999;margin-top:3px}
.dbtns{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
.linebtn{background:#06C755;color:white;border:none;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.linebtn:hover{background:#05b34c}
.prevbtn{background:#4A7BFF;color:white;border:none;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.prevbtn:hover{background:#3a6bef}
.delbtn{background:#ff4757;color:white;border:none;padding:9px 14px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.delbtn:hover{background:#e84141}
.modal-bg{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:100;align-items:center;justify-content:center}
.modal-bg.open{display:flex}
.modal{background:white;border-radius:16px;padding:28px;max-width:500px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-height:90vh;overflow-y:auto}
.modal h3{font-size:15px;font-weight:700;color:#333;margin-bottom:16px}
.modal-msg{background:#f5f8ff;border-left:3px solid #4A7BFF;padding:14px;border-radius:6px;font-size:14px;color:#444;line-height:1.8;white-space:pre-wrap;margin-bottom:18px;min-height:80px}
.modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
.mbtn{border:none;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}
.mbtn-send{background:#06C755;color:white}.mbtn-send:hover{background:#05b34c}
.mbtn-regen{background:#FF9F43;color:white}.mbtn-regen:hover{background:#e8902e}
.mbtn-cancel{background:#eee;color:#555}.mbtn-cancel:hover{background:#ddd}
.mbtn-primary{background:#4A7BFF;color:white}.mbtn-primary:hover{background:#3a6bef}
.mbtn-danger{background:#ff4757;color:white}.mbtn-danger:hover{background:#e84141}
.modal-type{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.mtype-btn{border:1px solid #e0e0e0;background:white;padding:5px 12px;border-radius:20px;font-size:12px;cursor:pointer;color:#555}
.mtype-btn.active{background:#4A7BFF;color:white;border-color:#4A7BFF}
.card{background:white;border-radius:12px;padding:18px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
.card h3{font-size:12px;color:#999;font-weight:500;margin-bottom:12px}
.bigpb{height:10px;background:#f0f0f0;border-radius:5px;margin:8px 0}
.bigpf{height:100%;border-radius:5px;background:#4A7BFF}
.pnums{display:flex;justify-content:space-between;font-size:12px;color:#999}
.afeedback{background:#f5f8ff;border-left:3px solid #4A7BFF;padding:12px;border-radius:4px;font-size:13px;color:#444;line-height:1.7}
.erow{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.erow label{font-size:12px;color:#777;width:70px;flex-shrink:0}
.erow input,.erow select{border:1px solid #e0e0e0;border-radius:6px;padding:6px 10px;font-size:13px;flex:1}
.notes{width:100%;border:1px solid #e0e0e0;border-radius:6px;padding:10px;font-size:13px;resize:vertical;min-height:72px;font-family:inherit}
.savebtn{background:#4A7BFF;color:white;border:none;padding:8px 20px;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600}
.savebtn:hover{background:#3a6bef}
.right{background:white;border-left:1px solid #e0e0e0;padding:16px;overflow-y:auto}
.right h2{font-size:12px;color:#999;font-weight:500;margin-bottom:10px}
.sci{padding:10px 0;border-bottom:1px solid #f5f5f5}
.sct{font-size:12px;color:#888}
.sctitle{font-size:13px;font-weight:500;color:#333;margin-top:2px}
.scbadge{display:inline-block;font-size:10px;padding:2px 8px;border-radius:10px;margin-top:4px;background:#e8f5e9;color:#2e7d32}
.sbadge{display:inline-block;font-size:10px;padding:2px 7px;border-radius:10px;margin-left:5px;vertical-align:middle}
.sbadge-grad{background:#e3f2fd;color:#1565c0}
.sbadge-sus{background:#fff3e0;color:#e65100}
.hist-item{padding:6px 0;border-bottom:1px solid #f5f5f5}
.hist-type{font-weight:600;color:#4A7BFF;font-size:11px}
.hist-time{color:#aaa;font-size:11px;margin-left:6px}
.msg-item{padding:10px;background:#f5f8ff;border-radius:8px;margin-bottom:6px}
.msg-name{font-weight:600;font-size:12px;color:#333}
.msg-time{font-size:11px;color:#aaa}
.msg-text{font-size:13px;color:#444;margin-top:4px}
.unread-dot{width:8px;height:8px;background:#ff4757;border-radius:50%;display:inline-block;margin-left:4px}
</style>
</head>
<body>
<header>
  受講生ダッシュボード ― 友彩
  <div class="hdr-btns">
    <button class="hdr-btn bulk-btn" onclick="openBulkSend()">一斉送信</button>
    <a href="https://docs.google.com/spreadsheets/d/1z1gvME-9VQI_Zawt10nOHRsWVrUnar4HXoXqVl63z2I/edit" target="_blank" class="hdr-btn sheet-btn">ワーク管理シート</a>
  </div>
</header>
<div class="stats">
  <div class="stat"><div class="stat-val" id="s1">-</div><div class="stat-lbl">在籍</div></div>
  <div class="stat"><div class="stat-val" id="s2">-%</div><div class="stat-lbl">平均進捗</div></div>
  <div class="stat"><div class="stat-val" id="s3" style="color:#e53935">-</div><div class="stat-lbl">要注意（30%以下）</div></div>
  <div class="stat"><div class="stat-val" id="s4">-</div><div class="stat-lbl">最終更新</div></div>
</div>
<div class="main">
  <div class="list">
    <div class="list-hd">
      <span id="lhd">受講生</span>
      <button class="add-btn" onclick="openAddStudent()">＋ 追加</button>
    </div>
    <div id="litems"></div>
  </div>
  <div class="detail" id="detail"><div class="empty">← 受講生を選んでください</div></div>
  <div class="right">
    <h2>受信メッセージ <span id="unread-dot" style="display:none" class="unread-dot"></span></h2>
    <div id="messages-list"><div style="font-size:12px;color:#bbb;padding:4px 0">メッセージなし</div></div>
    <div style="margin-top:20px"></div>
    <h2>自動配信スケジュール</h2>
    <div class="sci"><div class="sct">毎週月曜 09:00</div><div class="sctitle">マインドセット</div><span class="scbadge">設定済み</span></div>
    <div class="sci"><div class="sct">毎週水曜 09:00</div><div class="sctitle">中間チェックイン</div><span class="scbadge">設定済み</span></div>
    <div class="sci"><div class="sct">毎週金曜 09:00</div><div class="sctitle">週間お疲れさま</div><span class="scbadge">設定済み</span></div>
    <div class="sci"><div class="sct">毎月1日 09:00</div><div class="sctitle">感謝の先取り＆振り返り</div><span class="scbadge">設定済み</span></div>
    <div class="sci"><div class="sct">毎月28日 09:00</div><div class="sctitle">月末振り返りレポート</div><span class="scbadge">設定済み</span></div>
  </div>
</div>

<!-- Preview Modal -->
<div class="modal-bg" id="modal">
  <div class="modal">
    <h3>メッセージプレビュー</h3>
    <div class="modal-type" id="preview-types">
      <button class="mtype-btn active" data-type="monday" onclick="setType(this)">月曜</button>
      <button class="mtype-btn" data-type="wednesday" onclick="setType(this)">水曜</button>
      <button class="mtype-btn" data-type="friday" onclick="setType(this)">金曜</button>
      <button class="mtype-btn" data-type="gratitude" onclick="setType(this)">毎月1日</button>
      <button class="mtype-btn" data-type="monthly" onclick="setType(this)">月末</button>
    </div>
    <div class="modal-msg" id="modal-msg">生成中...</div>
    <div class="modal-actions">
      <button class="mbtn mbtn-cancel" onclick="closeModal()">キャンセル</button>
      <button class="mbtn mbtn-regen" onclick="regenerate()">再生成</button>
      <button class="mbtn mbtn-send" onclick="sendFromModal()">このまま送信</button>
    </div>
  </div>
</div>

<!-- Add Student Modal -->
<div class="modal-bg" id="add-modal">
  <div class="modal">
    <h3>受講生を追加</h3>
    <div class="erow"><label>LINE ID</label><input id="a-id" placeholder="U..."></div>
    <div class="erow"><label>名前</label><input id="a-name" placeholder="例：かすみん"></div>
    <div class="erow"><label>入会日</label><input id="a-joined" placeholder="例：2025-04"></div>
    <div class="erow"><label>ステージ</label><input id="a-stage" placeholder="例：ステージ1"></div>
    <div class="erow"><label>進捗率</label><input id="a-progress" type="number" min="0" max="100" value="0"></div>
    <div class="erow"><label>仕事</label><input id="a-job" placeholder="例：ハンドメイド作家"></div>
    <div class="erow" style="align-items:flex-start"><label style="padding-top:6px">メモ</label><textarea class="notes" id="a-notes" placeholder="最近の状況など"></textarea></div>
    <div class="modal-actions">
      <button class="mbtn mbtn-cancel" onclick="closeAddModal()">キャンセル</button>
      <button class="mbtn mbtn-primary" onclick="addStudent()">追加する</button>
    </div>
  </div>
</div>

<!-- Bulk Send Modal -->
<div class="modal-bg" id="bulk-modal">
  <div class="modal" style="max-width:600px">
    <div id="bulk-step1">
      <h3>一斉送信 - メッセージ種類を選択</h3>
      <p style="font-size:13px;color:#666;margin-bottom:14px">アクティブな受講生全員のメッセージをプレビューします。</p>
      <div class="modal-type" id="bulk-types">
        <button class="mtype-btn active" data-type="monday" onclick="setBulkType(this)">月曜</button>
        <button class="mtype-btn" data-type="wednesday" onclick="setBulkType(this)">水曜</button>
        <button class="mtype-btn" data-type="friday" onclick="setBulkType(this)">金曜</button>
        <button class="mtype-btn" data-type="gratitude" onclick="setBulkType(this)">毎月1日</button>
        <button class="mtype-btn" data-type="monthly" onclick="setBulkType(this)">月末</button>
      </div>
      <div class="modal-actions">
        <button class="mbtn mbtn-cancel" onclick="closeBulkModal()">キャンセル</button>
        <button class="mbtn mbtn-primary" onclick="generateBulkPreview()">プレビュー生成</button>
      </div>
    </div>
    <div id="bulk-step2" style="display:none">
      <h3>一斉送信 - メッセージ確認・編集</h3>
      <p style="font-size:12px;color:#888;margin-bottom:12px">各メッセージを確認・編集してから送信してね</p>
      <div id="bulk-preview-list" style="max-height:50vh;overflow-y:auto"></div>
      <div class="modal-actions">
        <button class="mbtn mbtn-cancel" onclick="closeBulkModal()">キャンセル</button>
        <button class="mbtn mbtn-regen" onclick="showBulkStep1()">← 戻る</button>
        <button class="mbtn mbtn-send" onclick="executeBulkSend()">全員に送信</button>
      </div>
    </div>
  </div>
</div>

<script>
const COLORS=['#4A7BFF','#FF6B6B','#FF9F43','#26de81','#a29bfe','#fd79a8','#00cec9','#6c5ce7'];
let students=[],selectedId=null,modalStudentId=null,modalType='monday',bulkType='monday';
function c(i){return COLORS[i%COLORS.length]}
function statusBadge(s){
  if(s==='graduated')return '<span class="sbadge sbadge-grad">卒業</span>';
  if(s==='suspended')return '<span class="sbadge sbadge-sus">休会</span>';
  return '';
}
function renderStats(){
  const active=students.filter(s=>!s.status||s.status==='active');
  document.getElementById('s1').textContent=active.length;
  const avg=active.length?Math.round(active.reduce((a,s)=>a+(s.progress||0),0)/active.length):0;
  document.getElementById('s2').textContent=avg+'%';
  document.getElementById('s3').textContent=active.filter(s=>(s.progress||0)<=30).length;
  document.getElementById('s4').textContent=new Date().toLocaleDateString('ja-JP');
}
function renderList(){
  document.getElementById('lhd').textContent='受講生 '+students.length+' 名';
  document.getElementById('litems').innerHTML=students.map((s,i)=>
    '<div class="sitem'+(s.id===selectedId?' active':'')+'" data-id="'+s.id+'" onclick="sel(this.dataset.id)">'+
    '<div class="av" style="background:'+c(i)+'">'+s.name[0]+'</div>'+
    '<div class="sinfo"><div class="sname">'+s.name+statusBadge(s.status)+'</div>'+
    '<div class="sstage">'+(s.current_stage||'-')+'</div>'+
    '<div class="pb"><div class="pf" style="width:'+(s.progress||0)+'%"></div></div></div>'+
    '<div class="ppct">'+(s.progress||0)+'%</div></div>'
  ).join('');
}
function sel(id){
  selectedId=id;
  const s=students.find(x=>x.id===id);
  if(!s)return;
  renderList();
  const i=students.indexOf(s);
  document.getElementById('detail').innerHTML=
    '<div class="dhead">'+
    '<div class="dav" style="background:'+c(i)+'">'+s.name[0]+'</div>'+
    '<div><div class="dname">'+s.name+'</div><div class="dmeta">入会 '+s.joined_at+' · '+(s.current_stage||'-')+'</div></div>'+
    '<div class="dbtns">'+
    '<button class="prevbtn" data-id="'+id+'" onclick="openPreview(this.dataset.id)">プレビュー</button>'+
    '<button class="linebtn" data-id="'+id+'" onclick="sendLine(this.dataset.id)">LINE送信</button>'+
    '<button class="delbtn" data-id="'+id+'" onclick="deleteStudent(this.dataset.id)">削除</button>'+
    '</div></div>'+
    '<div class="card"><h3>進捗</h3>'+
    '<div class="pnums"><span>'+s.name+'</span><span>'+(s.progress||0)+' / 100</span></div>'+
    '<div class="bigpb"><div class="bigpf" style="width:'+(s.progress||0)+'%"></div></div></div>'+
    '<div class="card"><h3>最近のメモ</h3><div class="afeedback">'+(s.notes||'メモなし')+'</div></div>'+
    '<div class="card"><h3>送信履歴</h3><div id="hist-list" style="font-size:12px;color:#bbb">読み込み中...</div></div>'+
    '<div class="card"><h3>進捗を更新</h3>'+
    '<div class="erow"><label>ステージ</label><input id="es" value="'+(s.current_stage||'')+'" placeholder="例：ステージ2"></div>'+
    '<div class="erow"><label>進捗率</label><input id="ep" type="number" min="0" max="100" value="'+(s.progress||0)+'"></div>'+
    '<div class="erow"><label>ステータス</label><select id="est">'+
    '<option value="active"'+((!s.status||s.status==='active')?' selected':'')+'>アクティブ</option>'+
    '<option value="graduated"'+(s.status==='graduated'?' selected':'')+'>卒業</option>'+
    '<option value="suspended"'+(s.status==='suspended'?' selected':'')+'>休会</option>'+
    '</select></div>'+
    '<div class="erow" style="align-items:flex-start"><label style="padding-top:6px">メモ</label><textarea class="notes" id="en">'+(s.notes||'')+'</textarea></div>'+
    '<button class="savebtn" data-id="'+id+'" onclick="save(this.dataset.id)">保存する</button></div>';
  loadHistory(id);
}
async function loadHistory(id){
  const res=await fetch('/api/history/'+encodeURIComponent(id));
  const data=await res.json();
  const el=document.getElementById('hist-list');
  if(!el)return;
  if(!data.length){el.textContent='まだ送信履歴がないよ';return;}
  const types={monday:'月曜',wednesday:'水曜',friday:'金曜',monthly:'月末',gratitude:'感謝',manual:'手動'};
  el.innerHTML=data.map(h=>
    '<div class="hist-item"><span class="hist-type">'+(types[h.message_type]||h.message_type)+'</span>'+
    '<span class="hist-time">'+new Date(h.sent_at).toLocaleString('ja-JP')+'</span></div>'
  ).join('');
}
async function save(id){
  const stage=document.getElementById('es').value;
  const progress=parseInt(document.getElementById('ep').value);
  const notes=document.getElementById('en').value;
  const status=document.getElementById('est').value;
  await fetch('/api/students/'+encodeURIComponent(id),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({current_stage:stage,progress,notes,status})});
  const s=students.find(x=>x.id===id);
  s.current_stage=stage;s.progress=progress;s.notes=notes;s.status=status;
  renderList();renderStats();alert('保存しました！');
}
async function sendLine(id){
  if(!confirm('このユーザーにLINEメッセージを送りますか？'))return;
  await fetch('/api/send/'+encodeURIComponent(id),{method:'POST'});
  alert('送信しました！');
  loadHistory(id);
}
async function deleteStudent(id){
  const s=students.find(x=>x.id===id);
  if(!confirm(s.name+'を削除しますか？この操作は元に戻せません。'))return;
  await fetch('/api/students/'+encodeURIComponent(id),{method:'DELETE'});
  students=students.filter(x=>x.id!==id);
  selectedId=null;
  renderList();renderStats();
  document.getElementById('detail').innerHTML='<div class="empty">← 受講生を選んでください</div>';
}
function openAddStudent(){
  ['a-id','a-name','a-joined','a-stage','a-job','a-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('a-progress').value=0;
  document.getElementById('add-modal').classList.add('open');
}
function closeAddModal(){document.getElementById('add-modal').classList.remove('open');}
async function addStudent(){
  const id=document.getElementById('a-id').value.trim();
  const name=document.getElementById('a-name').value.trim();
  if(!id||!name){alert('LINE IDと名前は必須やで！');return;}
  const body={
    id,name,
    joined_at:document.getElementById('a-joined').value.trim(),
    current_stage:document.getElementById('a-stage').value.trim(),
    progress:parseInt(document.getElementById('a-progress').value)||0,
    job:document.getElementById('a-job').value.trim(),
    notes:document.getElementById('a-notes').value.trim(),
    status:'active'
  };
  await fetch('/api/students',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  closeAddModal();
  await load();
  alert(name+'を追加したよ！');
}
function openBulkSend(){
  bulkType='monday';
  document.querySelectorAll('#bulk-types .mtype-btn').forEach(b=>b.classList.toggle('active',b.dataset.type==='monday'));
  showBulkStep1();
  document.getElementById('bulk-modal').classList.add('open');
}
function closeBulkModal(){document.getElementById('bulk-modal').classList.remove('open');}
function showBulkStep1(){
  document.getElementById('bulk-step1').style.display='block';
  document.getElementById('bulk-step2').style.display='none';
}
function setBulkType(btn){
  bulkType=btn.dataset.type;
  document.querySelectorAll('#bulk-types .mtype-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}
async function generateBulkPreview(){
  const active=students.filter(s=>!s.status||s.status==='active');
  document.getElementById('bulk-step1').style.display='none';
  document.getElementById('bulk-step2').style.display='block';
  const list=document.getElementById('bulk-preview-list');
  list.innerHTML='<div style="font-size:13px;color:#888;padding:12px">生成中... しばらく待ってね</div>';
  const results=[];
  for(const s of active){
    const res=await fetch('/api/preview/'+encodeURIComponent(s.id)+'?type='+bulkType,{method:'POST'});
    const data=await res.json();
    results.push({id:s.id,name:s.name,message:data.message||''});
  }
  list.innerHTML=results.map((r,i)=>
    '<div style="margin-bottom:16px;border:1px solid #e0e0e0;border-radius:10px;overflow:hidden">'+
    '<div style="background:#f5f8ff;padding:8px 12px;font-size:13px;font-weight:600;color:#333">'+r.name+'</div>'+
    '<textarea id="bulk-msg-'+i+'" data-id="'+r.id+'" style="width:100%;padding:10px;border:none;font-size:13px;line-height:1.7;font-family:inherit;resize:vertical;min-height:80px">'+r.message+'</textarea>'+
    '</div>'
  ).join('');
}
async function executeBulkSend(){
  const textareas=document.querySelectorAll('#bulk-preview-list textarea');
  if(!textareas.length){alert('先にプレビューを生成してね！');return;}
  if(!confirm(textareas.length+'名に送信しますか？'))return;
  const messages=Array.from(textareas).map(t=>({id:t.dataset.id,message:t.value,type:bulkType}));
  const res=await fetch('/api/send-all',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,type:bulkType})});
  const data=await res.json();
  closeBulkModal();
  alert('送信完了！'+data.count+'名に送ったよ。');
  if(selectedId)loadHistory(selectedId);
}
async function openPreview(id){
  modalStudentId=id;modalType='monday';
  document.querySelectorAll('#preview-types .mtype-btn').forEach(b=>b.classList.toggle('active',b.dataset.type==='monday'));
  document.getElementById('modal').classList.add('open');
  await loadPreview();
}
function closeModal(){document.getElementById('modal').classList.remove('open');modalStudentId=null;}
function setType(btn){
  modalType=btn.dataset.type;
  document.querySelectorAll('#preview-types .mtype-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  loadPreview();
}
async function loadPreview(){
  const el=document.getElementById('modal-msg');
  el.textContent='生成中...';
  const res=await fetch('/api/preview/'+encodeURIComponent(modalStudentId)+'?type='+modalType,{method:'POST'});
  const data=await res.json();
  el.textContent=data.message||'エラーが発生しました';
}
async function regenerate(){await loadPreview();}
async function sendFromModal(){
  const msg=document.getElementById('modal-msg').textContent;
  if(!modalStudentId||!msg)return;
  await fetch('/api/send-message/'+encodeURIComponent(modalStudentId),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,type:modalType})});
  closeModal();alert('送信しました！');
  loadHistory(modalStudentId);
}
async function loadMessages(){
  const res=await fetch('/api/messages');
  const data=await res.json();
  const unread=data.filter(m=>!m.is_read).length;
  document.getElementById('unread-dot').style.display=unread>0?'inline-block':'none';
  const el=document.getElementById('messages-list');
  if(!data.length){el.innerHTML='<div style="font-size:12px;color:#bbb;padding:4px 0">メッセージなし</div>';return;}
  el.innerHTML=data.slice(0,5).map(m=>
    '<div class="msg-item">'+
    '<div style="display:flex;justify-content:space-between"><span class="msg-name">'+(m.student_name||'不明')+'</span>'+
    '<span class="msg-time">'+new Date(m.received_at).toLocaleDateString('ja-JP')+'</span></div>'+
    '<div class="msg-text">'+m.message+'</div></div>'
  ).join('');
}
async function load(){
  const res=await fetch('/api/students');
  students=await res.json();
  renderStats();renderList();
  loadMessages();
}
load();
</script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    if (url.pathname === '/webhook' && request.method === 'POST') {
      const body = await request.json();
      for (const event of (body.events || [])) {
        if (event.type === 'message' && event.message.type === 'text') {
          const userId = event.source.userId;
          const text = event.message.text;
          const student = await env.DB.prepare("SELECT name FROM students WHERE id=?").bind(userId).first();
          await env.DB.prepare(
            "INSERT INTO line_messages (student_id, student_name, message, received_at) VALUES (?, ?, ?, ?)"
          ).bind(userId, student?.name || null, text, new Date().toISOString()).run();
        }
      }
      return new Response('OK', { headers: cors });
    }

    if (url.pathname === '/api/students') {
      if (request.method === 'GET') {
        const result = await env.DB.prepare("SELECT * FROM students ORDER BY name").all();
        return Response.json(result.results, { headers: cors });
      }
      if (request.method === 'POST') {
        const body = await request.json();
        await env.DB.prepare(
          "INSERT INTO students (id, name, joined_at, current_stage, progress, job, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(body.id, body.name, body.joined_at, body.current_stage, body.progress, body.job, body.notes, body.status || 'active').run();
        return Response.json({ ok: true }, { headers: cors });
      }
    }

    if (url.pathname.startsWith('/api/students/')) {
      const id = decodeURIComponent(url.pathname.split('/')[3]);
      if (request.method === 'PUT') {
        const body = await request.json();
        await env.DB.prepare(
          "UPDATE students SET current_stage=?, progress=?, notes=?, status=? WHERE id=?"
        ).bind(body.current_stage, body.progress, body.notes, body.status || 'active', id).run();
        return Response.json({ ok: true }, { headers: cors });
      }
      if (request.method === 'DELETE') {
        await env.DB.prepare("DELETE FROM students WHERE id=?").bind(id).run();
        return Response.json({ ok: true }, { headers: cors });
      }
      const student = await env.DB.prepare("SELECT * FROM students WHERE id=?").bind(id).first();
      return Response.json(student, { headers: cors });
    }

    if (url.pathname === '/api/send-all' && request.method === 'POST') {
      const body = await request.json();
      const messageType = body.type || 'monday';
      let count = 0;
      if (body.messages && body.messages.length) {
        for (const m of body.messages) {
          await sendLine(m.id, m.message, env.LINE_CHANNEL_ACCESS_TOKEN);
          await env.DB.prepare(
            "INSERT INTO feedback_history (student_id, message_type, message, sent_at) VALUES (?, ?, ?, ?)"
          ).bind(m.id, m.type || messageType, m.message, new Date().toISOString()).run();
          count++;
        }
      } else {
        const result = await env.DB.prepare("SELECT * FROM students WHERE status='active' OR status IS NULL").all();
        for (const student of result.results) {
          const feedback = await generateFeedback(student, messageType, env.ANTHROPIC_API_KEY);
          await sendLine(student.id, feedback, env.LINE_CHANNEL_ACCESS_TOKEN);
          await env.DB.prepare(
            "INSERT INTO feedback_history (student_id, message_type, message, sent_at) VALUES (?, ?, ?, ?)"
          ).bind(student.id, messageType, feedback, new Date().toISOString()).run();
          count++;
        }
      }
      return Response.json({ ok: true, count }, { headers: cors });
    }

    if (url.pathname.startsWith('/api/preview/')) {
      const id = decodeURIComponent(url.pathname.split('/')[3]);
      const type = url.searchParams.get('type') || 'monday';
      const student = await env.DB.prepare("SELECT * FROM students WHERE id=?").bind(id).first();
      if (!student) return Response.json({ error: 'not found' }, { status: 404, headers: cors });
      const message = await generateFeedback(student, type, env.ANTHROPIC_API_KEY);
      return Response.json({ message }, { headers: cors });
    }

    if (url.pathname.startsWith('/api/send-message/')) {
      const id = decodeURIComponent(url.pathname.split('/')[3]);
      const body = await request.json();
      await sendLine(id, body.message, env.LINE_CHANNEL_ACCESS_TOKEN);
      await env.DB.prepare(
        "INSERT INTO feedback_history (student_id, message_type, message, sent_at) VALUES (?, ?, ?, ?)"
      ).bind(id, body.type || 'manual', body.message, new Date().toISOString()).run();
      return Response.json({ ok: true }, { headers: cors });
    }

    if (url.pathname.startsWith('/api/send/')) {
      const id = decodeURIComponent(url.pathname.split('/')[3]);
      const student = await env.DB.prepare("SELECT * FROM students WHERE id=?").bind(id).first();
      if (!student) return Response.json({ error: 'not found' }, { status: 404, headers: cors });
      const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
      const day = jst.getUTCDay();
      const messageType = day === 1 ? 'monday' : day === 3 ? 'wednesday' : day === 5 ? 'friday' : 'monday';
      const feedback = await generateFeedback(student, messageType, env.ANTHROPIC_API_KEY);
      await sendLine(student.id, feedback, env.LINE_CHANNEL_ACCESS_TOKEN);
      await env.DB.prepare(
        "INSERT INTO feedback_history (student_id, message_type, message, sent_at) VALUES (?, ?, ?, ?)"
      ).bind(id, messageType, feedback, new Date().toISOString()).run();
      return Response.json({ ok: true }, { headers: cors });
    }

    if (url.pathname.startsWith('/api/history/')) {
      const id = decodeURIComponent(url.pathname.split('/')[3]);
      const result = await env.DB.prepare(
        "SELECT * FROM feedback_history WHERE student_id=? ORDER BY sent_at DESC LIMIT 20"
      ).bind(id).all();
      return Response.json(result.results, { headers: cors });
    }

    if (url.pathname === '/api/messages') {
      const result = await env.DB.prepare(
        "SELECT * FROM line_messages ORDER BY received_at DESC LIMIT 20"
      ).all();
      return Response.json(result.results, { headers: cors });
    }

    return new Response(HTML, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
  },

  async scheduled(event, env, ctx) {
    let messageType;
    if (event.cron === "0 0 28 * *") messageType = "monthly";
    else if (event.cron === "0 0 1 * *") messageType = "gratitude";
    else if (event.cron === "0 0 * * 2") messageType = "monday";
    else if (event.cron === "0 0 * * 4") messageType = "wednesday";
    else if (event.cron === "0 0 * * 6") messageType = "friday";
    else return;

    const students = await env.DB.prepare("SELECT * FROM students WHERE status='active' OR status IS NULL").all();
    for (const student of students.results) {
      const feedback = await generateFeedback(student, messageType, env.ANTHROPIC_API_KEY);
      await sendLine(student.id, feedback, env.LINE_CHANNEL_ACCESS_TOKEN);
      await env.DB.prepare("UPDATE students SET last_feedback_at=? WHERE id=?").bind(new Date().toISOString(), student.id).run();
      await env.DB.prepare(
        "INSERT INTO feedback_history (student_id, message_type, message, sent_at) VALUES (?, ?, ?, ?)"
      ).bind(student.id, messageType, feedback, new Date().toISOString()).run();
    }
  }
};

async function generateFeedback(student, messageType, apiKey) {
  const typePrompts = {
    monday: "月曜日のマインドセットメッセージを送ります。今週も頑張れる気持ちになれるよう、受講生の仕事・状況を踏まえた前向きな言葉と、今週意識してほしいことを1つ伝えてください。",
    wednesday: "水曜日の中間チェックインメッセージを送ります。今どんな感じ？という雰囲気で、今週の半分を過ごした受講生に寄り添いながら、今困ってることや行き詰まってることがあれば教えてほしい、と自然に投げかける内容にしてください。",
    friday: "金曜日の週間お疲れさまメッセージを送ります。今週1週間を労い、受講生の成長を認め、週末をゆっくり過ごしてほしいという温かい内容にしてください。",
    monthly: "月末の振り返りレポートをお願いするメッセージを送ります。以下の5項目を返信してもらえるようにお願いしてください。温かく、負担にならない雰囲気で伝えてください。①うまくいったこと ②うまくいかなかったこと ③今月の感謝額（売り上げ） ④今月叶ったこと ⑤来月実行すること",
    gratitude: "毎月1日の感謝メッセージを送ります。2つのことを自然に投げかけてください。①感謝の先取り：今月末に感謝したいことを今から想像して、どんなことに感謝できそうか先取りして書いてもらう。②感謝の振り返り：先月1ヶ月を振り返って、感謝できることを3つ教えてもらう。受講生の仕事・状況を踏まえて、ポジティブで温かい雰囲気で伝えてください。"
  };

  const prompt = "あなたは女性起業家・副業ママのビジネスコーチ「友彩（ゆうさい）」のAIアシスタントです。受講生へのLINEメッセージを作成してください。【ルール】200〜300文字以内。ため口で書く（です・ます調は使わない）。関西弁を必ず混ぜる（やん・やで・やね・やんか・めっちゃ・ほんま など。ただしこてこてにしすぎない）。受講生の仕事・状況を具体的に言及する。個人の家族状況などは文中に書かない。締めは温かい言葉で終わる。【メッセージの種類】" + typePrompts[messageType] + "【受講生情報】仮名: " + student.name + " 入会日: " + student.joined_at + " 現在のステージ: " + student.current_stage + " 進捗率: " + student.progress + "% 仕事・肩書き: " + student.job + " 最近の状況: " + student.notes;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await res.json();
  return data.content[0].text;
}

async function sendLine(userId, message, token) {
  await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text: message }]
    })
  });
}
