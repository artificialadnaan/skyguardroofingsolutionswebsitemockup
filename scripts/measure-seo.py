"""Identical structural checks for any exported site tree. These are not Google scores."""
import json, sys
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse, unquote
class Page(HTMLParser):
 def __init__(self):
  super().__init__(); self.tags=[]; self.h1=0; self.title=False; self.titles=[]; self.text=''
 def handle_starttag(self,tag,attrs):
  self.tags.append((tag,dict(attrs)))
  if tag=='h1': self.h1+=1
  if tag=='title': self.title=True; self.text=''
 def handle_endtag(self,tag):
  if tag=='title': self.titles.append(self.text.strip()); self.title=False
 def handle_data(self,data):
  if self.title:self.text+=data
root=Path(sys.argv[1]); files=[root/'index.html',*sorted((root/'pages').glob('*.html')),*sorted((root/'pages/blog').glob('*.html'))]
rows=[];bad=[]
for file in files:
 if not file.exists():continue
 route='/' if file.name=='index.html' else '/'+file.relative_to(root).as_posix()
 p=Page();p.feed(file.read_text());meta=[a for t,a in p.tags if t=='meta'];images=[a for t,a in p.tags if t=='img' and a.get('src')]
 canon=[a.get('href') for t,a in p.tags if t=='link' and a.get('rel')=='canonical']
 desc=[a.get('content') for a in meta if a.get('name')=='description']
 for t,a in p.tags:
  key='href' if t=='a' else 'src' if t in ['img','script'] else None
  if not key or not a.get(key):continue
  u=urlparse(urljoin('https://www.skyguardrs.com'+route,a[key]))
  if u.scheme not in ['https','http'] or u.hostname!='www.skyguardrs.com':continue
  dest=root/unquote(u.path).lstrip('/') if u.path!='/' else root/'index.html'
  if not dest.exists():bad.append({'page':route,'target':u.path})
 rows.append({'path':route,'oneH1':p.h1==1,'uniqueTitleCandidate':p.titles[0] if len(p.titles)==1 else '', 'description':desc[0] if len(desc)==1 else '', 'correctCanonical':canon==['https://www.skyguardrs.com'+route], 'images':len(images),'responsiveImages':sum('srcset' in i for i in images),'dimensionedImages':sum('width' in i and 'height' in i for i in images)})
summary={'pages':len(rows),'oneH1':sum(r['oneH1'] for r in rows),'canonicalCorrect':sum(r['correctCanonical'] for r in rows),'titlesPresent':sum(bool(r['uniqueTitleCandidate']) for r in rows),'uniqueTitles':len(set(r['uniqueTitleCandidate'] for r in rows if r['uniqueTitleCandidate'])),'descriptionsPresent':sum(bool(r['description']) for r in rows),'uniqueDescriptions':len(set(r['description'] for r in rows if r['description'])),'images':sum(r['images'] for r in rows),'responsiveImages':sum(r['responsiveImages'] for r in rows),'dimensionedImages':sum(r['dimensionedImages'] for r in rows),'brokenLocalLinkOccurrences':len(bad)}
print(json.dumps({'summary':summary,'brokenLinks':bad,'pages':rows},indent=2))
