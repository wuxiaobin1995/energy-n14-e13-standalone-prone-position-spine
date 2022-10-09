/*
 * @Author      : Mr.bin
 * @Date        : 2022-03-07 09:31:16
 * @LastEditTime: 2022-10-08 11:01:49
 * @Description : Dexie
 */
import Dexie from 'dexie'

export function initDB() {
  const db = new Dexie('Energy_N14_E13_Standalone_Prone_Position_Spine') // 与项目名保持一致
  db.version(1).stores({
    user: 'userId',
    test_data: '++,userId,pdfTime,[userId+pdfTime]',
    train_data: '++,userId,pdfTime,[userId+pdfTime]'
  })
  return db
}
