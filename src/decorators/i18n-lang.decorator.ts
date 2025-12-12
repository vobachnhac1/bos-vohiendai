import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to get current language from request
 * Usage: @Lang() lang: string
 */
export const Lang = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    
    // Priority: query param > header > default
    const queryLang = request.query?.lang || request.query?.language;
    if (queryLang && ['vi', 'en'].includes(queryLang)) {
      return queryLang;
    }
    
    const headerLang = request.headers['accept-language'];
    if (headerLang) {
      const lang = headerLang.split(',')[0].split('-')[0];
      if (['vi', 'en'].includes(lang)) {
        return lang;
      }
    }
    
    return 'en'; // Default language
  },
);

