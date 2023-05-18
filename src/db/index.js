/*
 * @Author      : Mr.bin
 * @Date        : 2022-03-07 09:31:16
 * @LastEditTime: 2023-05-05 10:48:55
 * @Description : Dexie
 */
import Dexie from 'dexie'

export function initDB() {
  const db = new Dexie('Energy_N14_E13_Standalone_Prone_Position_Spine') // 与项目名保持一致
  db.version(1).stores({
    user: 'userId,userName',
    test_data:
      '++,userId,type,pdfTime,[userId+pdfTime],[userId+type],[userId+type+pdfTime]',
    train_data:
      '++,userId,type,pdfTime,[userId+pdfTime],[userId+type],[userId+type+pdfTime]'
  })
  return db
}
