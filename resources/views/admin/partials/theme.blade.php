<style>
/* Tema "Console Chrome" — terinspirasi Nintendo.com 2001 */
:root{--primary:#e60012;--signal:#f68d1f;--amber:#ecab37;--gold:#e48600;--canvas:#7a8aba;--sky:#9fbee7;--lav:#acace7;--ice:#c0d5e6;--peri:#8ba1d4;--indigo:#3d4f97;--muted:#60619c;--plat:#dedede;--carbon:#21242e;--hair:#5a5f8c;--teal:#206479}
*{box-sizing:border-box}
html{background:var(--indigo)}
body{margin:0;min-height:100vh;color:var(--carbon);font:13px/1.45 Arial,Helvetica,sans-serif;background-color:var(--canvas);background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px)}
a{color:var(--indigo)}
.halftone{background-color:var(--carbon);background-image:radial-gradient(circle,rgba(255,255,255,.09) 1px,transparent 1.3px);background-size:4px 4px}

/* Wrapper & navigasi ganda */
.wrap{max-width:1120px;min-height:100vh;margin:0 auto;display:flex;flex-direction:column;background-color:var(--canvas);background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 3px);border-left:2px solid var(--carbon);border-right:2px solid var(--carbon)}
.nav-bar{display:flex;align-items:center;gap:4px;padding:0 12px;min-height:46px;border-bottom:1px solid var(--hair)}
.logo{margin-right:12px;padding:4px 14px;background:#fff;color:var(--primary);border:2px solid var(--primary);border-radius:9999px;font:900 14px "Arial Black",Arial,sans-serif;text-decoration:none;white-space:nowrap}
.nl{padding:15px 10px;color:var(--gold);font:700 13px Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase;text-decoration:none}
.nl:hover{color:var(--amber)}
.nl.active{color:var(--amber);box-shadow:inset 0 -3px 0 var(--amber)}
.spacer{flex:1}
.chip,.button{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:30px;padding:7px 14px;border:1px solid var(--hair);border-bottom-width:2px;border-radius:2px;background:var(--carbon);color:#fff;font:700 11px Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase;text-decoration:none;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}
.button:hover{background:#3a3e4d}
.button:active{transform:translateY(1px)}
.chip,.button.light{background:var(--amber);color:var(--carbon);border-color:#f7d58a #b9801b #b9801b #f7d58a}
.chip:hover,.button.light:hover{background:var(--gold)}
.button.submit{background:var(--signal);color:#fff;border-color:#ffbe7a #b86500 #b86500 #ffbe7a}
.button.submit:hover{background:#d97a12}
.button.danger{background:var(--primary);color:#fff;border-color:#ff6b78 #8f000b #8f000b #ff6b78}
.button.danger:hover{background:#c20010}
.logout-form{margin:0}
.logout-form .button{background:#3a3e4d}
.subnav{display:flex;overflow:auto;background:var(--sky);border-bottom:2px solid var(--indigo);box-shadow:inset 0 1px 0 rgba(255,255,255,.6)}
.subnav a{padding:8px 14px;color:var(--carbon);border-right:1px solid rgba(61,79,151,.35);font:700 11px Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase;text-decoration:none;white-space:nowrap}
.subnav a:hover{background:var(--ice)}
.subnav a.active{background:var(--indigo);color:#fff}
.main{flex:1;min-width:0;padding:16px}
.footer-bar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:14px 16px;border-top:2px solid var(--indigo);color:var(--sky);font-size:10px}
.badge{padding:2px 6px;background:var(--amber);color:var(--carbon);border-radius:2px;font-weight:700;letter-spacing:.5px}

/* Hero judul halaman (outline + bayangan keras) */
.top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:16px;padding:18px 18px 20px;background-color:var(--lav);background-image:repeating-linear-gradient(0deg,rgba(61,79,151,.14) 0 1px,transparent 1px 12px),repeating-linear-gradient(90deg,rgba(61,79,151,.14) 0 1px,transparent 1px 12px);border:1px solid var(--indigo);border-top-color:#fff;border-bottom-width:3px;box-shadow:inset 0 1px 0 rgba(255,255,255,.6);clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,0 100%)}
.top h1{margin:0;color:#fff;font:900 clamp(24px,5vw,40px)/1 "Arial Black",Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase;-webkit-text-stroke:2px var(--indigo);paint-order:stroke fill;text-shadow:3px 3px 0 var(--indigo)}
.muted{color:var(--indigo);font-weight:700}
.top .muted{font-size:12px}

/* Plat panel */
.panel{margin-top:16px;background:var(--plat);border:1px solid var(--indigo);border-top-color:#fff;border-bottom-width:3px;box-shadow:inset 0 1px 0 #fff;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%)}
.main>.panel:first-child{margin-top:0}
.bar{padding:8px 12px;background:var(--canvas);border-bottom:2px solid var(--indigo);box-shadow:inset 0 1px 0 rgba(255,255,255,.5);font:700 11px Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase}
.bar::before{content:"≡ "}
.pad{padding:16px}
.panel h2{margin:0 0 8px;font-size:14px;text-transform:uppercase;letter-spacing:.5px;color:var(--indigo)}
.panel p{margin:0 0 6px;line-height:1.5}
.actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-top:16px}
.stat{background:var(--peri);border:1px solid var(--indigo);border-top-color:#fff;border-bottom-width:3px;box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}
.stat small{display:block;padding:6px 10px;background:var(--canvas);border-bottom:2px solid var(--indigo);font:700 11px Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase}
.stat strong{display:block;padding:12px 10px 14px;color:#fff;font:900 36px/1 "Arial Black",Arial,sans-serif;-webkit-text-stroke:1.5px var(--indigo);paint-order:stroke fill;text-shadow:2px 2px 0 var(--indigo)}
.notice{margin-top:0;padding:12px;background:#fff;border:1px solid var(--indigo);line-height:1.5}
.notice::before{content:"ℹ  INFO";display:block;margin:-12px -12px 10px;padding:5px 12px;background:var(--amber);color:var(--carbon);font:700 11px Arial,sans-serif;letter-spacing:.5px}

/* Tabel */
.table-wrap{overflow:auto}
.data{width:100%;min-width:620px;border-collapse:collapse}
.data th,.data td{padding:9px 10px;text-align:left;vertical-align:top;border-bottom:1px solid #c4c8da;font-size:12px}
.data th{background:var(--peri);border-bottom:2px solid var(--indigo);font:700 11px Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase;white-space:nowrap}
.data td{background:#fff}
.data tr:nth-child(even) td{background:#ececf3}
.data tbody tr:hover td{background:var(--ice)}
.data td.muted{font-weight:400}
.data .actions{margin:0}
.data form{margin:0}
.pager svg{width:16px;height:16px}

/* Form */
.field{display:block;margin:0 0 14px}
.field span{display:block;margin-bottom:4px;font:700 12px Arial,sans-serif}
.field input,.field textarea,.login-input{width:100%;padding:8px;background:#fff;color:var(--carbon);border:1px solid var(--hair);border-radius:2px;box-shadow:inset 1px 1px 0 rgba(61,79,151,.3);font:14px Arial,sans-serif}
.field textarea{min-height:110px;resize:vertical}
.field input:focus,.field textarea:focus,.login-input:focus{outline:2px solid var(--amber);outline-offset:0;border-color:var(--indigo)}
.field small{display:block;margin-top:4px}
.error-text{display:block;margin:-8px 0 12px;color:var(--primary);font-size:12px;font-weight:700}
.alert{margin-bottom:16px;padding:11px 14px;background:#fff;border:1px solid var(--teal);border-left:6px solid var(--teal);font-weight:700}
.alert.err{border-color:var(--primary);border-left-color:var(--primary);color:var(--primary)}
.dotted{margin:16px 0;border:0;border-top:1px dotted var(--muted)}

/* Login */
.login-page{display:grid;place-items:center;padding:20px}
.login-box{width:min(100%,430px)}
.login-box .nav-bar{justify-content:space-between;border:1px solid var(--hair)}
.bubble{position:relative;display:inline-block;margin:14px 0 18px 8px;padding:8px 12px;background:#fff;border:2px solid var(--carbon);border-radius:10px;font-size:11px;font-weight:700}
.bubble::after{content:"";position:absolute;left:18px;bottom:-9px;width:12px;height:12px;background:#fff;border-right:2px solid var(--carbon);border-bottom:2px solid var(--carbon);transform:rotate(45deg)}
.login-box .panel{margin-top:0}
.login-box .button.submit{width:100%;margin-top:6px;min-height:40px;font-size:12px}
.login-box .sub{display:block;margin-top:12px;padding:8px 14px;background:var(--sky);border:1px solid var(--indigo);color:var(--carbon);font:700 11px Arial,sans-serif;letter-spacing:.5px;text-transform:uppercase;text-decoration:none}
.login-box .sub:hover{background:var(--ice)}

@media(max-width:760px){
.wrap{border-left:0;border-right:0}
.nav-bar{flex-wrap:wrap;padding:6px 10px}
.nl{padding:12px 8px}
.top{flex-direction:column;align-items:flex-start}
.main{padding:12px}
.button,.chip{min-height:44px}
.subnav a{padding:14px}
}
</style>
