import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const user = getCurrentUserByContext(context);
    return data ? user?.[data] : user;
  },
);

const getCurrentUserByContext = (context: ExecutionContext) => {
  if (context.getType() === 'http') {
    const request = context.switchToHttp().getRequest();
    return request['user'];
  }
};

