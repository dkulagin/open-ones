/**
 * Licensed to Open-Ones Group under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Open-Ones Group licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package rocky.engine;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * @author thachle
 *
 */
public class ScheduledExecutorServiceExample {
    private static long start = Long.MIN_VALUE;

    public static void main(String[] args) {
        ScheduledExecutorService service = Executors.newScheduledThreadPool(1);
        printTime("start");
        service.schedule(new Runnable() {
            @Override
            public void run() {
                printTime("done");
            }
        }, 1000, TimeUnit.MILLISECONDS);
        printTime("scheduled");
    }

    private static void printTime(String text) {
        long now = System.currentTimeMillis();
        if (start == Long.MIN_VALUE) {
            start = now;
        }
        System.out.println(text + " - " + (now - start) + "ms");
    }
}
