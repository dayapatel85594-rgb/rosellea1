import kill from 'kill-port';

export default async function killPort(port) {
  try {
    await kill(port);
    console.log(`Freed port ${port}`);
  } catch {
    console.warn(`Port ${port} not in use`);
  }
}
