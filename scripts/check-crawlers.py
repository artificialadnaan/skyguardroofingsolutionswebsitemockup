"""Validate deployed crawl artifacts with standard-library robots/XML parsers."""
import json
from pathlib import Path
from urllib.parse import urlsplit, unquote
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'dist'
ORIGIN = json.loads((ROOT / 'data/business.json').read_text())['origin']
REPORT = json.loads((ROOT / '.build/report.json').read_text())
AGENTS = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'GPTBot',
          'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'PerplexityBot',
          'Perplexity-User', 'Google-Extended']
robots = RobotFileParser()
robots.parse((PUBLIC / 'robots.txt').read_text().splitlines())
assert robots.site_maps() == [ORIGIN + '/sitemap.xml'], 'Incorrect sitemap discovery'
tree = ET.parse(PUBLIC / 'sitemap.xml')
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9',
      'i': 'http://www.google.com/schemas/sitemap-image/1.1'}
pages, images = [], []
for entry in tree.getroot().findall('s:url', ns):
    pages.append(entry.findtext('s:loc', namespaces=ns))
    current_images = [node.text for node in entry.findall('i:image/i:loc', ns)]
    assert len(current_images) == len(set(current_images)), 'Repeated image on sitemap page'
    assert len(current_images) <= 1000, 'Image sitemap per-page limit exceeded'
    images.extend(current_images)
expected = {ORIGIN + page['route'] for page in REPORT['publishedPages']}
assert set(pages) == expected and len(pages) == len(expected), 'Sitemap publication mismatch'
assert not ({ORIGIN + page['route'] for page in REPORT['withheldPages']} & set(pages))
for url in pages + images:
    parsed = urlsplit(url)
    assert parsed.scheme + '://' + parsed.netloc == ORIGIN, 'Unexpected sitemap host'
    pathname = unquote(parsed.path)
    file = (PUBLIC / ('index.html' if pathname == '/' else pathname.lstrip('/'))).resolve()
    assert file.is_relative_to(PUBLIC.resolve()) and file.is_file(), 'Missing public sitemap resource'
    for agent in AGENTS:
        assert robots.can_fetch(agent, url), f'{agent} cannot crawl {url}'
for agent in AGENTS:
    for route in ['/robots.txt', '/sitemap.xml', '/css/styles.css', '/js/main.js']:
        assert robots.can_fetch(agent, ORIGIN + route), f'{agent} cannot render public pages'
    for route in ['/api/lead', '/healthz']:
        assert not robots.can_fetch(agent, ORIGIN + route), f'Operational endpoint crawlable: {route}'
print(json.dumps({'pages': len(pages), 'imageReferences': len(images),
                  'uniqueImages': len(set(images)), 'crawlerAgents': len(AGENTS),
                  'publicContentAllowed': True, 'operationalEndpointsExcluded': True}, indent=2))
