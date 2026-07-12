import type { Context } from "elysia";

type SetContext = Context["set"];

const StatusCode = {
  Ok: 200,
  Created: 201,
  NoContent: 204,
  NotFound: 404,
};

export const ResponseHelper = {
  Ok: <T>(set: SetContext, message: string, data: T) => {
    set.status = StatusCode.Ok;

    return {
      success: true,
      message,
      data,
    };
  },

  Created: <T>(set: SetContext, message: string, data: T) => {
    set.status = StatusCode.Created;

    return {
      success: true,
      message,
      data,
    };
  },

  NoContent: (set: SetContext) => {
    set.status = StatusCode.NoContent;
    return;
  },

  NotFound: (set: SetContext, message: string) => {
    set.status = StatusCode.NotFound;

    return {
      success: false,
      message,
    };
  },
};
