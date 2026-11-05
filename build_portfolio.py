from pathlib import Path
import base64, json, hashlib, shutil, re

ROOT = Path(__file__).resolve().parent
MEDIA = ROOT / 'media'
SHOWREEL = MEDIA / 'box-showreel-original-voice.mp4'
ODYSSEY_4K = MEDIA / 'odyssey-4k-web.mp4'
POSTER = MEDIA / 'box-opening.jpg'

def data(path, mime):
    p = Path(path)
    assert p.is_file(), p
    return 'data:' + mime + ';base64,' + base64.b64encode(p.read_bytes()).decode('ascii')

assets = {
    'sprite': data(MEDIA / 'tuan-tuan.png', 'image/png'),
    'poster': data(POSTER, 'image/jpeg'),
    'preview': data(POSTER, 'image/jpeg'),
    'portal': data(POSTER, 'image/jpeg'),
    'music': 'assets/cornfield-chase.mp3',
    'musicPoster': data(ROOT/'project-assets/interstellar-cover.jpg','image/jpeg'),
    'xiaowangye': data(ROOT/'project-assets'/'xiaowangye.png','image/png'),
}
videos = [
    {'title': '《Box》时空之盒 · 连续叙事版', 'duration': '15.5 秒', 'durationSeconds': 15.52, 'note': 'AI 视觉叙事 · 48fps补帧 · 片尾：We shall see.',
     'id':'box','filename':'box-showreel-original-voice.mp4','resolution':'1280 × 720','label':'AI视觉叙事 / 连续剪辑','poster':'box-cover','portrait':False,'muted':False,'path': SHOWREEL,
     'cues':[{'t':0,'zh':'开盒 · 邀请','en':'Opening · invitation'},{'t':5.75,'zh':'穿越 · 荒野','en':'Crossing · the field'},{'t':9.33,'zh':'探索 · 束缚','en':'Search · bound'},{'t':12.08,'zh':'合盒 · 收束','en':'Closing the box'}]},
    {'id':'embedded','title':'触屏开发板 · 完整实物操作','duration':'73.5 秒','durationSeconds':73.51,'note':'滑动解锁 / 相册 / 音乐与视频界面 · 默认静音，可开启原声','filename':'embedded-demo-full.mp4','resolution':'320 × 568 竖屏','label':'真实开发板 / 完整操作录像','poster':'embedded-demo-poster','portrait':True,'muted':True,'path': MEDIA/'embedded-demo-full.mp4','cues':[{'t':0,'zh':'完整操作 · 滑动解锁 / 相册 / 音乐 / 视频','en':'Full demo · unlock / gallery / music / video'}]},
]
heritage_dir=MEDIA
heritage_names=['heritage-clean-1.mp4','heritage-clean-2.mp4','heritage-clean-3.mp4']
heritage_files=[heritage_dir/f'heritage-clean-{i}.mp4' for i in (1,2,3)]
heritage_host='assets/'
videos.append({'id':'culture','title':'非遗文化采访 · 完整视频','duration':'10:03.6','durationSeconds':603.62,'note':'本人参与采访与剪辑 · 完整成片分三段连续播放','filename':heritage_names[0],'resolution':'640 × 362','label':'非遗公益 / 采访成片','poster':'heritage-poster','portrait':False,'muted':False,'path':heritage_files[0], 'chapters':[{'data':heritage_host+name,'range':span} for name,span in zip(heritage_names,['00:00–03:21.2','03:21.2–06:42.4','06:42.4–10:03.6'])], 'chapterDurations':[201.22,201.20,201.20], 'offsets':[0,201.22,402.42], 'totalDuration':603.62, 'cues':[{'t':0,'zh':'第 1 段 · 00:00–03:21','en':'Part 1 · 00:00–03:21'},{'t':201.22,'zh':'第 2 段 · 03:21–06:42','en':'Part 2 · 03:21–06:42'},{'t':402.42,'zh':'第 3 段 · 06:42–10:03.6','en':'Part 3 · 06:42–10:03.6'}]})
videos.append({'id':'newvideo','title':'《奥德赛》古装剧情剪辑','duration':'46.1 秒','durationSeconds':46.10,'note':'古装剧情剪辑 · 46 秒 · 高清修复','filename':'odyssey-4k-web.mp4','resolution':'1440 × 1080','label':'视频作品 / 剧情剪辑','poster':'new-video-poster','portrait':False,'muted':False,'path':ODYSSEY_4K,'cues':[{'t':0,'zh':'《奥德赛》剧情片段','en':'Odyssey · historical drama'}]})
videos.append({'id':'ubt','title':'《职业性紧张》职场情绪短片','duration':'3:57.8','durationSeconds':237.80,'note':'优必选企业文化组新媒体运营实习期间的短视频作品 · AI 动画，讨论职业性紧张的表现与支持方式','filename':'ubt-culture-short.mp4','resolution':'1440 × 810','sourceResolution':'960 × 544','label':'企业文化 / 新媒体运营实习','poster':'ubt-poster','portrait':False,'muted':False,'path': MEDIA/'ubt-culture-short.mp4','cues':[{'t':0,'zh':'开场 · 职业性紧张','en':'Opening · occupational stress'},{'t':90,'zh':'三个核心维度','en':'Three core dimensions'},{'t':150,'zh':'短暂放松','en':'A short break'},{'t':210,'zh':'员工支持方式','en':'Support at work'}]})
video_order=['ubt','culture','box','newvideo','embedded']
videos.sort(key=lambda v: video_order.index(v['id']))
video_files = [v['path'] for v in videos]
video_names = [v['filename'] for v in videos]
for video in videos:
    source=video.pop('path')
    video['data'] = video['chapters'][0]['data'] if video['id']=='culture' else (heritage_host+video['filename'] if video['id']=='newvideo' else data(source, 'video/mp4'))

projects = [
 {'id':'pga', 'category':'hardware', 'number':'01', 'kind':'本科毕业设计', 'title':'可编程增益放大器集成电路', 'subtitle':'以器件与电路原理为起点，理解偏置、放大和增益控制。', 'period':'2025.10 — 2026.06', 'status':'设计与仿真实践', 'tags':['110 nm CMOS','电路分析','初步仿真接触'], 'visual':'circuit',
  'background':'本科毕业设计围绕可编程增益放大器展开，在 110 nm CMOS 工艺背景下学习电路设计、仿真与版图检查。',
  'work':['分析偏置、放大及增益控制相关电路，整理原理图和模块连接。','在本科项目中初步接触 Cadence Virtuoso，进行 DC、AC 和瞬态仿真。','接触物理版图和 DRC/LVS 检查，整理设计、仿真及说明材料。'],
  'result':'形成了本科毕业设计中的电路、仿真、版图及说明材料；当前页面展示项目概述。',
  'boundary':'以设计、仿真和基础版图检查为范围；未主张完成流片或芯片实测。软件工具定位为本科项目中的初步接触。'},
 {'id':'layout','category':'hardware','number':'02','kind':'模拟集成电路课程实践','title':'两级运放与电流基准版图','subtitle':'从电路连接走向物理布局，学习规则与连通性检查。','period':'本科阶段','status':'课程实践','tags':['模拟电路','版图基础','DRC / LVS'],'visual':'layout',
  'background':'围绕两级运算放大器和电流基准电路的本科版图课程练习。',
  'work':['在课程项目中接触 Cadence Virtuoso 的版图操作。','结合电路连接理解器件放置与连线关系。','查看 DRC/LVS 中的间距和连接检查结果，学习定位基础问题。'],
  'result':'积累了模拟电路版图与验证流程的课程接触经验。','boundary':'属于课程级基础实践，不作为熟练版图工程或独立量产设计能力的证明。'},
 {'id':'radio','category':'hardware','number':'03','kind':'硬件实验与工程训练','title':'收音机焊接、PCB 检查与机加工','subtitle':'在真实装配过程中积累焊接、检查与基础排查经验。','period':'本科阶段','status':'已完成基础训练','tags':['手工焊接','PCB 检查','车床基础'],'visual':'hardware',
  'background':'本科实验和工程训练，包括收音机套件装配及基础制造训练。',
  'work':['依照实验说明和电路资料装配、手工焊接收音机套件。','进行基础 PCB 检查与故障排查，关注连接和装配质量。','完成车床操作及基础机加工的入门训练与考核。'],
  'result':'完成基础装配实验和工程训练，建立了从电路资料到实际硬件的初步认识。','boundary':'实践程度为本科基础训练，不将其表述为复杂 PCB 设计或高阶仪器操作能力。'},
 {'id':'pet','category':'ai','number':'04','kind':'AI 协作 · 动画资产','title':'团团 · 多状态动画萌宠','subtitle':'将角色想法变成有帧布局、有透明通道、可检查的动画资产。','period':'2026.10','status':'资产完成 / 本地校验通过','tags':['9 类动画状态','16 个朝向','73 个有效帧'],'visual':'pet',
  'background':'与 Codex 协作制作带有 GPT 风格徽记的熊猫角色，将视觉偏好转为规范化动画资产。',
  'work':['我提出角色风格和视觉要求，并通过反馈调整表现。','AI 协助拆分动作状态，生成素材并整理到 8 列 × 11 行精灵图中。','保存逐格检查记录，核对布局、透明背景和空白格等资产要求。'],
  'result':'输出 1536 × 2288 的 RGBA 精灵图：9 类动作、16 个朝向、73 个有效帧。保存的本地校验记录无错误或警告；本页可以播放帧序列。',
  'boundary':'成果是动画资产及校验流程，不将其描述为自研动画引擎；本页演示为基于实际素材的帧序列播放。'},
 {'id':'box','category':'ai','number':'05','kind':'AI 协作 · 视频内容','title':'《Box》AI 视觉叙事与短片剪辑','subtitle':'从创意要求、分镜和反馈，走向可播放的视觉叙事作品。','period':'2026.10','status':'精选短片完成','tags':['分镜与提示词','素材筛选','剪辑交付'],'visual':'video',
  'background':'个人创意练习，以时空之盒串联不同角色的好奇、失落与束缚，与 AI 协作迭代镜头要求和视觉素材。',
  'work':['我确定主题、人物顺序、情绪对照和修改要求，通过多轮反馈调整生成内容。','AI 辅助整理分镜与生成提示词，筛选可用镜头，并用 FFmpeg 完成裁切、拼接、音频衔接和编码。','从五个素材文件中筛选连续镜头，删除重复伸手、替代人物版本与多余回场，用四个叙事段落完成开盒、穿越、人物变化和合盒。'],
  'result':'完成 15.5 秒、1280 × 720、经运动补帧后 48fps 导出的 H.264 / AAC 连续叙事短片，保留对应原声；输出文件通过全片解码和抽帧检查。',
  'boundary':'AI 生成素材的个人创作练习；本页展示已完成的精选剪辑，不将其表述为商业投放项目。'},
 {'id':'notion','category':'ai','number':'06','kind':'AI 协作 · 工作流','title':'学习与求职任务管理工作流','subtitle':'把课件、截止日期和实际进度整理为能持续调整的任务。','period':'2026.10','status':'计划已写入 Notion','tags':['资料整理','任务拆解','工具连接'],'visual':'workflow',
  'background':'硕士课程复习、作业与求职安排并行，需要将零散信息整理成具体任务。',
  'work':['我提供课程资料、时间约束、理解难点与实际进度，并确认优先级。','AI 辅助抽取事项、拆分知识点与例题、安排阶段任务，并写入 Notion。','通过多轮反馈修正日期和任务范围，将已确认信息与待核实事项区分。'],
  'result':'形成按阶段组织、带完成标准的学习与求职计划，衔接资料整理与任务记录。','boundary':'本页展示工作流思路，不公开个人完整日程及私有 Notion 页面；未将任务记录等同于任务实际完成。'},
 {'id':'embedded','category':'course','number':'08','kind':'课程接触','title':'嵌入式多媒体课程实践','subtitle':'接触开发板上的显示与触摸交互，对软硬件配合建立初步认识。','period':'2025.08','status':'课程参与 / 基础接触','tags':['显示与输入','开发板实践','课程学习'],'visual':'embedded',
  'background':'本科阶段参与嵌入式多媒体课程实践，内容涉及图像浏览、音视频播放和触摸界面。',
  'work':['在课程环境中接触开发板的显示与输入交互。','参与课程应用的功能检查，了解软硬件配合的基本过程。'],
  'result':'形成课程实践经历，作为电子与系统课程的补充。','boundary':'本人更偏向半导体与硬件基础，不将 ARM、Linux 或嵌入式软件开发列为熟练技能。'},
 {'id':'culture','category':'community','number':'09','kind':'公益与传播实践','title':'非遗文化传播公益活动','subtitle':'通过现场记录、采访和内容制作，支持亲子非遗体验传播。','period':'2025.01.01 — 01.08','status':'活动参与','tags':['影像记录','师生采访','内容整理'],'visual':'community',
  'background':'参与捏泥人等非遗公益教学活动，配合团队记录教学与现场过程。',
  'work':['参与现场执行、影像拍摄与师生采访。','整理活动素材，参与采访视频后期及学校公众号相关内容制作。'],
  'result':'支持非遗公益活动的现场记录与传播。','boundary':'以团队成员身份参与，不将团队成果全部归为个人独立完成。'},
]

awards = [
 ['2026.06', '2026 届', '优秀毕业生', '校级：北京理工大学珠海学院'],
 ['2026.04.30', '2024—2025 学年', '校级优秀学生', '校级：北京理工大学珠海学院'],
 ['2025.09.25', '2024—2025 学年', '优秀学生二等奖学金', '校级：北京理工大学珠海学院'],
 ['2024.12.20', '2023—2024 学年', '校级优秀学生', '校级：北京理工大学珠海学院'],
 ['2024.09.25', '2023—2024 学年', '优秀学生二等奖学金', '校级：北京理工大学珠海学院'],
 ['2023.11.19', '2023 年 · 第三届', '趣味数学建模知识竞赛 · 个人二等奖', '校级：北京理工大学珠海学院'],
 ['2023.11.19', '2023 年 · 第三届', '趣味数学建模知识竞赛 · 团队二等奖', '校级：北京理工大学珠海学院'],
]

order = ['culture','pga','box','pet','notion','layout','radio','embedded']
projects.sort(key=lambda p: order.index(p['id']))
for project in projects:
    if project['id'] == 'box':
        project['subtitle'] = '将叙事需求转为分镜、素材顺序与可播放的视频原型，持续检查和调整交付。'
    elif project['id'] == 'notion':
        project['subtitle'] = '把零散资料、截止日期和实际进度整理成明确任务，在沟通中持续修正。'
case_studies = json.loads((ROOT/'case_studies.json').read_text(encoding='utf-8'))
assert set(case_studies) == {p['id'] for p in projects}
for project in projects:
    project.update(case_studies[project['id']])
projects.sort(key=lambda p: order.index(p['id']))
for i,project in enumerate(projects,1): project['number']=f'{i:02d}'
case_sources=json.loads((ROOT/'case_assets.json').read_text(encoding='utf-8'))
case_assets={key:data(ROOT/'project-assets'/info['file'],info['mime']) for key,info in case_sources.items()}
template = (ROOT / 'template.html').read_text(encoding='utf-8')
# Task 1: mount the existing compact-piano modules after all original scripts.
for marker, source, tag, closing in (
    ('PIANO_COMPACT_STYLE', '_piano_compact.css', 'style', '</head>'),
    ('PIANO_COMPACT_SCRIPT', '_piano_compact.js', 'script', '</body>'),
    ('EDGE_GLASS_STYLE', '_edge_glass.css', 'style', '</head>'),
    ('EDGE_GLASS_SCRIPT', '_edge_glass.js', 'script', '</body>'),
    ('PANEL_STARS_STYLE', '_panel_stars.css', 'style', '</head>'),
    ('PANEL_CONSTELLATION_DATA', '_panel_constellations.js', 'script', '</body>'),
    ('PANEL_STARS_SCRIPT', '_panel_stars.js', 'script', '</body>'),
    ('MOBILE_READABILITY_STYLE', '_mobile_readability.css', 'style', '</head>'),
    ('MOBILE_READABILITY_SCRIPT', '_mobile_readability.js', 'script', '</body>'),
    ('GUESTBOOK_STYLE', '_guestbook.css', 'style', '</head>'),
    ('GUESTBOOK_SCRIPT', '_guestbook.js', 'script', '</body>'),
):
    template = re.sub(r'<!--__' + marker + r'__-->.*?<!--/__' + marker + r'__-->', '', template, flags=re.S)
    fragment = '<!--__' + marker + '__--><' + tag + '>' + (ROOT / source).read_text(encoding='utf-8') + '</' + tag + '><!--/__' + marker + '__-->'
    assert closing in template
    template = template.replace(closing, fragment + closing, 1)
# Public discussions are loaded only near the guestbook; no credentials in this config.
guestbook_config=json.loads((ROOT/'guestbook.config.json').read_text(encoding='utf-8'))
guestbook_config_tag='<script id="portfolioGuestbookConfig" type="application/json">'+json.dumps(guestbook_config,ensure_ascii=False).replace('</','<\\/')+'</script>'
template=template.replace('</main>',(ROOT/'_guestbook.html').read_text(encoding='utf-8')+guestbook_config_tag+'</main>',1)
texture_files = {
 'mercury':'1k_mercury.jpg','venus':'1k_venus_atmosphere.jpg',
 'earth':'1k_earth_daymap.jpg','earth_night':'1k_earth_nightmap.jpg',
 'earth_clouds':'1k_earth_clouds.jpg','earth_specular':'1k_earth_specular_map.png',
 'mars':'1k_mars.jpg','jupiter':'1k_jupiter.jpg','saturn':'1k_saturn.jpg',
 'saturn_ring':'1k_saturn_ring_alpha.png','uranus':'1k_uranus.jpg','neptune':'1k_neptune.jpg','sun':'1k_sun.jpg',
}
planet_textures = {key:data(ROOT/'planet-textures'/name,'image/png' if name.endswith('.png') else 'image/jpeg') for key,name in texture_files.items()}
payload = {'projects': projects, 'awards': awards, 'assets': assets, 'videos': videos,'planetTextures':planet_textures,'caseAssets':case_assets,'personal':json.loads((ROOT/'personal_data.json').read_text(encoding='utf-8'))}
# These optional references already exist in the template, but their source
# files are absent in this rolled-back project. Do not ship dangling requests
# or enable another historical navigator by importing unrelated backup code.
legacy_optional_resources = [
    'fonts/jiale-brush.woff', 'wormhole-cinema.js', 'portal-cinema.js',
    'music-jewel.js', 'personal-lettering.js', 'restored-original.css',
    'personal-polish.css', 'lab-clarity.css', 'lab-clarity.js',
]
missing_legacy_resources = [name for name in legacy_optional_resources if not (ROOT / 'assets' / name).is_file()]

def omit_missing_legacy_references(html):
    for name in missing_legacy_resources:
        url = re.escape('assets/' + name)
        if name.endswith('.js'):
            html = re.sub(r'<script\b[^>]*\bsrc=["\']' + url + r'["\'][^>]*>\s*</script>', '', html)
        else:
            html = re.sub(r'<link\b[^>]*\bhref=["\']' + url + r'["\'][^>]*>', '', html)
    return html

def render(document):
    return omit_missing_legacy_references(template).replace('/*__PORTFOLIO_DATA__*/', 'const PORTFOLIO = ' + json.dumps(document, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + ';')
dist = ROOT / 'dist'
dist.mkdir(exist_ok=True)
# Web release: media loads on demand; this build does not create a bundled standalone HTML.
hosted = json.loads(json.dumps(payload,ensure_ascii=False))
asset_dir = dist / 'assets'
asset_dir.mkdir(exist_ok=True)
shutil.copyfile(ROOT / 'assets/piano-head-complete.png', asset_dir / 'piano-head-complete.png')
shutil.copytree(ROOT/'assets/constellation-badges',asset_dir/'constellation-badges',dirs_exist_ok=True)
shutil.copyfile(ROOT / 'assets/constellation-CREDITS.txt', asset_dir / 'constellation-CREDITS.txt')
shutil.copyfile(ROOT / 'assets/piano-hands-refined.png', asset_dir / 'piano-hands-refined.png')
# Required POV media: video plus all 13 canvas fallback frames.
pov_warp_resources = ['pov-warp.mp4'] + [f'pov-warp/{i:02d}.png' for i in range(1, 14)]
for relative in pov_warp_resources:
    source = ROOT / 'assets' / relative
    assert source.is_file(), f'Missing POV resource: {source}'
    destination = asset_dir / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
weeknd_dir = asset_dir / 'weeknd'
weeknd_dir.mkdir(exist_ok=True)
for photo in (ROOT / 'project-assets/weeknd').glob('*.jpg'):
    shutil.copyfile(photo, weeknd_dir / photo.name)
for key,name in texture_files.items():
    shutil.copyfile(ROOT/'planet-textures'/name,asset_dir/name)
    hosted['planetTextures'][key]='assets/'+name
asset_sources = {
    'sprite': ('tuan-tuan.png',MEDIA / 'tuan-tuan.png'),
    'poster': ('box-opening.jpg',POSTER),
    'preview': ('box-preview.jpg',POSTER),
    'portal': ('box-portal.jpg',POSTER),
    'music': ('cornfield-chase.mp3',MEDIA/'cornfield-chase.mp3'),
    'musicPoster': ('interstellar-cover.jpg',ROOT/'project-assets/interstellar-cover.jpg'),
    'xiaowangye': ('xiaowangye.png', ROOT/'project-assets'/'xiaowangye.png'),
}
for key,(name,source) in asset_sources.items():
    shutil.copyfile(source,asset_dir/name)
    hosted['assets'][key] = 'assets/' + name
for i,source in enumerate(video_files):
    name = video_names[i]
    shutil.copyfile(source,asset_dir/name)
    hosted['videos'][i]['data'] = 'assets/' + name
culture_index=next(i for i,v in enumerate(videos) if v['id']=='culture')
for i,source in enumerate(heritage_files):
    shutil.copyfile(source,asset_dir/heritage_names[i])
    hosted['videos'][culture_index]['chapters'][i]['data']='assets/'+heritage_names[i]
hosted['videos'][culture_index]['data']=hosted['videos'][culture_index]['chapters'][0]['data']
for old in ['heritage-part-1.mp4','heritage-part-2.mp4','heritage-part-3.mp4','box-showreel-english-ending.mp4','historical-drama-video.mp4']:
    stale=asset_dir/old
    if stale.exists():stale.unlink()
case_dir=asset_dir/'cases';case_dir.mkdir(exist_ok=True)
expected_cases={x['file'] for x in case_sources.values()}
for old in case_dir.iterdir():
    if old.is_file() and old.name not in expected_cases:old.unlink()
for key,info in case_sources.items():
    shutil.copyfile(ROOT/'project-assets'/info['file'],case_dir/info['file'])
    hosted['caseAssets'][key]='assets/cases/'+info['file']
(dist / 'index.html').write_text(render(hosted),encoding='utf-8')
shutil.copyfile(ROOT/'planet-textures/ATTRIBUTION.txt',asset_dir/'PLANET_TEXTURES_CREDITS.txt')
manifest = {'internships':len(payload['personal']['internships']), 'travel_countries':3, 'projects':len(projects), 'awards':len(awards), 'videos':len(videos), 'email':'3535348582@qq.com', 'html_bytes':(dist / 'index.html').stat().st_size, 'online_html_bytes':(dist / 'index.html').stat().st_size, 'sha256':hashlib.sha256((dist / 'index.html').read_bytes()).hexdigest(), 'self_contained':False, 'remote_video_note':'All media is local under assets/.'}
manifest['omitted_missing_legacy_resources'] = missing_legacy_resources
manifest['pov_warp_resources'] = ['assets/' + name for name in pov_warp_resources]
manifest['guestbook_resources'] = ['assets/constellation-badges/' + p.name for p in sorted((asset_dir/'constellation-badges').glob('*')) if p.is_file()]
(ROOT / 'build_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(manifest,ensure_ascii=False))
