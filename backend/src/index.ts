import app from './app';
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 4000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://0.0.0.0:${port}`);
});
