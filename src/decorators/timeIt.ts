export function timeIt(message: string) {
  return (_target: any, _name: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const startTime = new Date(Date.now());
      const result = await method.apply(this, args);
      const endTime = new Date(Date.now());
      console.log(`${message} took ${endTime.getTime() - startTime.getTime()}ms to complete.`);
      return result;
    };
  };
}
