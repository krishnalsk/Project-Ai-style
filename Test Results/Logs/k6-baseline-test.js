import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<1500', 'p(99)<2500'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.TARGET_URL || 'https://krishnalsk.github.io/Project-Ai-style';

export default function () {
  const endpoints = [
    '/',
    '/shop/',
    '/ai-stylist/',
    '/fabric-encyclopedia/',
  ];

  const target = BASE_URL + endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(target);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response under 1500ms': (r) => r.timings.duration < 1500,
  });

  sleep(0.1);
}
