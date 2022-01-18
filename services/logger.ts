// ---------------------------------- Logger Config -----------------------------------
import { transports, format } from 'winston'
import { logger } from 'express-winston'

const log = logger({
  transports: [new transports.Console()],
  format: format.combine(
    format.colorize(),
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    format.json(),
    format.printf((info) => `[${info.timestamp}] ${JSON.stringify(info.meta.req)} ------ ${JSON.stringify(info.meta.res)} ${info.level}: ${info.message}`)
  ),
  meta: true,
  expressFormat: true,
  colorize: true,
})

export default log
