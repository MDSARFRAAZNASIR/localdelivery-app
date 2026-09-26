import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1,
  duration: '5s',

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const health = http.get(
    'https://mayadelivery.online/health'
  );

  check(health, {
    'health status is 200': (r) => r.status === 200,
    'health status is ok': (r) => r.json().status === 'ok',
  });
}
