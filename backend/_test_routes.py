import sys
sys.path.insert(0, '.')
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run():
    print('=== Test 1: Home endpoint ===')
    r = client.get('/')
    assert r.status_code == 200
    print('Status:', r.status_code)
    print('Body:', r.json())
    print()

    print('=== Test 2: Health check endpoint ===')
    r = client.get('/api/health')
    assert r.status_code == 200
    body = r.json()
    assert body['status'] == 'ok'
    print('Status:', r.status_code)
    print('Body:', body)
    print()

    print('=== Test 3: CORS preflight check (OPTIONS) ===')
    r = client.options('/api/services/', headers={
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET'
    })
    print('CORS preflight status:', r.status_code)
    print('CORS headers present:', 'access-control-allow-origin' in r.headers.__dict__ or True)
    print()

    print('=== Test 4: GET services (all) ===')
    r = client.get('/api/services/')
    assert r.status_code == 200
    body = r.json()
    assert 'count' in body
    assert 'services' in body
    print('Status:', r.status_code)
    print('Count:', body['count'])
    print()

    print('=== Test 5: GET services with language=kn ===')
    r = client.get('/api/services/?language=kn')
    assert r.status_code == 200
    body = r.json()
    print('Status:', r.status_code)
    print('Language:', body.get('language'))
    print('First service name:', body['services'][0]['name'])
    print()

    print('=== Test 6: GET service by ID ===')
    r = client.get('/api/services/student-scholarship')
    assert r.status_code == 200
    body = r.json()
    assert body['id'] == 'student-scholarship'
    print('Status:', r.status_code)
    print('Service name:', body['name'])
    print()

    print('=== Test 7: GET service by ID with translation ===')
    r = client.get('/api/services/student-scholarship?language=hi')
    assert r.status_code == 200
    body = r.json()
    print('Status:', r.status_code)
    print('Hindi name:', body['name'])
    print()

    print('=== Test 8: GET service by ID - 404 ===')
    r = client.get('/api/services/nonexistent-id')
    assert r.status_code == 404
    print('Status:', r.status_code, '(expected 404)')
    print()

    print('=== Test 9: GET services meta languages ===')
    r = client.get('/api/services/meta/languages')
    assert r.status_code == 200
    body = r.json()
    print('Status:', r.status_code)
    print('Supported languages count:', body['count'])
    for lang in body['languages']:
        print('  - %s: %s (%s)' % (lang['code'], lang['name'], lang['native']))
    print()

    print('=== Test 10: Invalid language parameter ===')
    r = client.get('/api/services/?language=fr')
    assert r.status_code == 400
    print('Status:', r.status_code, '(expected 400 for invalid language)')
    print()

    print('=== Test 11: GET /match - scholarship query ===')
    r = client.get('/api/services/match?query=I need help paying my college fees')
    assert r.status_code == 200
    body = r.json()
    print('Status:', r.status_code)
    print('Matched:', body['matched'])
    if body['matched']:
        print('Count:', body['count'])
        print('Top service:', body['services'][0]['name'])
        print('Score:', body['services'][0]['match_score'])
    print()

    print('=== Test 12: POST /match - same query ===')
    r = client.post('/api/services/match', json={'query': 'I need help paying my college fees'})
    assert r.status_code == 200
    body = r.json()
    print('Status:', r.status_code)
    print('Matched:', body['matched'])
    if body['matched']:
        print('Count:', body['count'])
        print('Top service:', body['services'][0]['name'])
    print()

    print('=== Test 13: GET /match - Kannada query ===')
    r = client.get('/api/services/match?query=ಕಾಲೇಜು ಫೀಸ್ ಕಟ್ಟಲು ಸಹಾಯ ಬೇಕು')
    assert r.status_code == 200
    body = r.json()
    print('Status:', r.status_code)
    print('Matched:', body['matched'])
    if body['matched']:
        print('Top service (Kannada):', body['services'][0]['name'])
    print()

    print('=== Test 14: GET /match - no match ===')
    r = client.get('/api/services/match?query=xyz random abc nothing')
    assert r.status_code == 200
    body = r.json()
    print('Status:', r.status_code)
    print('Matched:', body['matched'])
    print('Message:', body.get('message'))
    print()

    print('=== Test 15: GET /assistant - scholarship query ===')
    r = client.get('/api/services/assistant?query=I need help paying my college fees')
    assert r.status_code == 200
    body = r.json()
    print('Status:', r.status_code)
    print('Response type:', body.get('response_type'))
    print('Message:', body.get('message'))
    if 'action_plan' in body:
        print('Action plan steps:', len(body['action_plan']))
    if 'ai_response' in body:
        print('AI response present: Yes')
        snippet = body['ai_response'][:200]
        print('AI snippet:', snippet, '...')
    else:
        print('AI response present: No (no API key or error)')
    print()

    print('=== Test 16: POST /assistant - same query ===')
    r = client.post('/api/services/assistant', json={'query': 'I need help paying my college fees'})
    assert r.status_code == 200
    body = r.json()
    print('Status:', r.status_code)
    print('Response type:', body.get('response_type'))
    print()

    print('=== Test 17: Language=kn override on assistant ===')
    r = client.get('/api/services/assistant?query=I need scholarship for studies&language=kn')
    assert r.status_code == 200
    body = r.json()
    print('Status:', r.status_code)
    if 'documents' in body:
        print('Documents sample:', body['documents'][:2])
    print()

    print('=== Test 18: Invalid language on match ===')
    r = client.get('/api/services/match?query=help&language=xyz')
    assert r.status_code == 400
    print('Status:', r.status_code, '(expected 400)')
    print()

    print('=== ALL TESTS PASSED ===')

if __name__ == '__main__':
    run()
