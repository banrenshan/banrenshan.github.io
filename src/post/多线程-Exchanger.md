---
title: 多线程-Exchanger
date: 2023-10-08
categories:
  - java
tags:
  - java
  - 多线程
---

## Exchanger

`Exchanger`用于线程间的数据交换。它提供一个同步点，在这个同步点两个线程可以交换彼此的数据。这两个线程通过`exchange`方法交换数据， 如果第一个线程先执行`exchange`方法，它会一直等待第二个线程也执行`exchange`，当两个线程都到达同步点时，这两个线程就可以交换数据，将本线程生产出来的数据传递给对方。

举例：校对工作

```java
public class ExchangerTest {

	private static final Exchanger<String> exgr = new Exchanger<String>();

	private static ExecutorService threadPool = Executors.newFixedThreadPool(2);

	public static void main(String[] args) {

		threadPool.execute(new Runnable() {
			@Override
			public void run() {
				try {
					String A = "银行流水A";// A录入银行流水数据
					exgr.exchange(A);
				} catch (InterruptedException e) {
				}
			}
		});

		threadPool.execute(new Runnable() {
			@Override
			public void run() {
				try {
					String B = "银行流水B";// B录入银行流水数据
					String A = exgr.exchange("B");
					System.out.println("A和B数据是否一致：" + A.equals(B) + ",A录入的是："
							+ A + ",B录入是：" + B);
				} catch (InterruptedException e) {
				}
			}
		});

		threadPool.shutdown();

	}
}
```

如果两个线程有一个没有到达`exchange`方法，则会一直等待,如果担心有特殊情况发生，避免一直等待，可以使用`exchange(V x, long timeout, TimeUnit unit)`设置最大等待时长。

## CountDownLatch

CountDownLatch允许单个线程等待多个其他线程全部执行完成后再执行自己的任务。例如旅游公司组织旅游，必须等待游客到齐之后才能发车。让我们用CountDownLatch模拟一下这个场景：

```java
public class CountDownLatchTest {
    public static void main(String[] args) {
        CountDownLatch countDownLatch = new CountDownLatch(20);
        for (int i = 0; i < 20; i++) {

            new Thread(new SomeBodyOne(countDownLatch, "游客" + (i + 1))).start();
        }
        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.err.println("所有人都上车了");
    }

    static class SomeBodyOne implements Runnable {

        private CountDownLatch countDownLatch;

        private String name;

        public SomeBodyOne(CountDownLatch countDownLatch, String name) {
            this.countDownLatch = countDownLatch;
            this.name = name;
        }

        @Override
        public void run() {
            System.err.println("我是游客" + name + "，我上车了");
            countDownLatch.countDown();
        }
    }
}
```

## CyclicBarrier

CyclicBarrier 的字面意思是可循环使用（Cyclic）的屏障（Barrier）。它要做的事情是，让一组线程到达一个屏障（也可以叫同步点）时被阻塞，直到最后一个线程到达屏障时，屏障才会开门，所有被屏障拦截的线程才会继续干活。CyclicBarrier默认的构造方法是CyclicBarrier(int parties)，其参数表示屏障拦截的线程数量，每个线程调用await方法告诉CyclicBarrier我已经到达了屏障，然后当前线程被阻塞。

```java
public class CyclicBarrierTest {

	static CyclicBarrier c = new CyclicBarrier(2);

	public static void main(String[] args) {
		new Thread(new Runnable() {

			@Override
			public void run() {
				try {
					c.await();
				} catch (Exception e) {

				}
				System.out.println(1);
			}
		}).start();

		try {
			c.await();
		} catch (Exception e) {

		}
		System.out.println(2);
	}
}
```

CountDownLatch的计数器只能使用一次。而CyclicBarrier的计数器可以使用reset() 方法重置。所以CyclicBarrier能处理更为复杂的业务场景，比如如果计算发生错误，可以重置计数器，并让线程们重新执行一次。

CyclicBarrier还提供其他有用的方法，比如getNumberWaiting方法可以获得CyclicBarrier阻塞的线程数量。isBroken方法用来知道阻塞的线程是否被中断。比如以下代码执行完之后会返回true。
```java
public class CyclicBarrierTest3 {

      static CyclicBarrier c = new CyclicBarrier(2);
      public static void main(String[] args) {
          Thread thread = new Thread(new Runnable() {
                  @Override
                  public void run() {
                      try {
                          c.await();
                      } catch (Exception e) {
                      }
                  }
              });
              thread.start();
              thread.interrupt();
              try {
                  c.await();
              } catch (Exception e) {
                  System.out.println(c.isBroken());
              }
          }
}
```

