import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 2,
  duration: '10s',

  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const response = http.get(
    'https://mayadelivery.online/api/products'
  );

  check(response, {
    'products status is 200': (r) => r.status === 200,
    'products success is true': (r) => r.json().success === true,
    'products field exists': (r) =>
      Array.isArray(r.json().products),
  });

  sleep(1);
}
